# Model Context Protocol (MCP) Server Integration: Technical Guide

## Overview

The Model Context Protocol (MCP) is a powerful extension mechanism that allows Roo-Code to communicate with external servers to access additional tools, data sources, and capabilities. This technical guide explores the implementation details, configuration options, and advanced integration patterns for working with MCP in Roo-Code.

## Core Architecture

### MCP Protocol Implementation

Roo-Code implements the MCP client using the `@modelcontextprotocol/sdk` package. The core integration is handled by the `McpHub` class in `src/services/mcp/McpHub.ts`, which manages:

1. Server connections
2. Tool discovery and execution
3. Resource access
4. Configuration persistence
5. Error handling and recovery

```typescript
export class McpHub {
  private providerRef: WeakRef<ClineProvider>
  private disposables: vscode.Disposable[] = []
  private settingsWatcher?: vscode.FileSystemWatcher
  private fileWatchers: Map<string, FSWatcher> = new Map()
  connections: McpConnection[] = []
  isConnecting: boolean = false
  
  // Methods for managing server connections, tools, and resources
  // ...
}
```

### Server Configuration Schema

MCP server configurations are validated using a Zod schema that enforces proper structure:

```typescript
export const StdioConfigSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  alwaysAllow: AlwaysAllowSchema.optional(),
  disabled: z.boolean().optional(),
  timeout: z.number().min(1).max(3600).optional().default(60),
})

const McpSettingsSchema = z.object({
  mcpServers: z.record(StdioConfigSchema),
})
```

### Connection Management

Each MCP server is connected through a separate transport and client instance:

```typescript
export type McpConnection = {
  server: McpServer
  client: Client
  transport: StdioClientTransport
}
```

This architecture allows for:
- Independent server lifecycle management
- Isolated error handling
- Server-specific capability discovery
- Custom timeouts and configurations

## Detailed MCP Server Implementation

### Connection Lifecycle

Roo-Code carefully manages the lifecycle of MCP server connections:

1. **Initialization**: On startup, Roo-Code loads server configurations and establishes connections:
   ```typescript
   private async initializeMcpServers(): Promise<void> {
     try {
       const settingsPath = await this.getMcpSettingsFilePath()
       const content = await fs.readFile(settingsPath, "utf-8")
       const config = JSON.parse(content)
       await this.updateServerConnections(config.mcpServers || {})
     } catch (error) {
       console.error("Failed to initialize MCP servers:", error)
     }
   }
   ```

2. **Connection Establishment**: Each server is connected with its own transport:
   ```typescript
   private async connectToServer(name: string, config: StdioServerParameters): Promise<void> {
     // Create a new transport and client
     const client = new Client(...)
     const transport = new StdioClientTransport({
       command: config.command,
       args: config.args,
       env: { ...config.env, ...(process.env.PATH ? { PATH: process.env.PATH } : {}) },
       stderr: "pipe",
     })
     
     // Configure error handling
     transport.onerror = async (error) => { ... }
     transport.onclose = async () => { ... }
     
     // Start the transport and connect
     await transport.start()
     await client.connect(transport)
     
     // Fetch initial capabilities
     connection.server.tools = await this.fetchToolsList(name)
     connection.server.resources = await this.fetchResourcesList(name)
     connection.server.resourceTemplates = await this.fetchResourceTemplatesList(name)
   }
   ```

3. **Connection Monitoring**: Servers are continuously monitored:
   - `transport.onerror` handler captures errors
   - `transport.onclose` detects disconnections
   - `transport.stderr` stream captures error output

4. **Auto-Reconnection**: File changes trigger automatic reconnection:
   ```typescript
   private setupFileWatcher(name: string, config: any) {
     const filePath = config.args?.find((arg: string) => arg.includes("build/index.js"))
     if (filePath) {
       const watcher = chokidar.watch(filePath, { ... })
       watcher.on("change", () => {
         console.log(`Detected change in ${filePath}. Restarting server ${name}...`)
         this.restartConnection(name)
       })
       this.fileWatchers.set(name, watcher)
     }
   }
   ```

### Server Status Management

Servers can be in one of three states, managed by the MCP Hub:

1. **Connected**: Server is running and available
   ```typescript
   connection.server.status = "connected"
   ```

2. **Connecting**: Server is in process of establishing connection
   ```typescript
   connection.server.status = "connecting"
   ```

3. **Disconnected**: Server is unavailable or encountered an error
   ```typescript
   connection.server.status = "disconnected"
   this.appendErrorMessage(connection, error.message)
   ```

The system provides real-time updates on server status to the UI:
```typescript
private async notifyWebviewOfServerChanges(): Promise<void> {
  // Servers are sorted in the order they are defined in the settings file
  await this.providerRef.deref()?.postMessageToWebview({
    type: "mcpServers",
    mcpServers: [...this.connections]
      .sort((a, b) => { ... })
      .map((connection) => connection.server),
  })
}
```

## Advanced Configuration Options

### Server Configuration Fields

| Field | Type | Description | Implementation Details |
|-------|------|-------------|------------------------|
| `command` | string | Executable command | Required, starts the server process |
| `args` | string[] | Command arguments | Optional, passed to the process |
| `env` | object | Environment variables | Optional, merged with system PATH |
| `alwaysAllow` | string[] | Pre-approved tools | Optional, stored in settings |
| `disabled` | boolean | Disable server | Optional, prevents connection |
| `timeout` | number | Operation timeout | Optional, 1-3600 seconds (default: 60) |

### Configuration Persistence

MCP server configurations are stored in a JSON file managed by Roo-Code:

```typescript
async getMcpSettingsFilePath(): Promise<string> {
  const provider = this.providerRef.deref()
  if (!provider) {
    throw new Error("Provider not available")
  }
  const mcpSettingsFilePath = path.join(
    await provider.ensureSettingsDirectoryExists(),
    GlobalFileNames.mcpSettings,
  )
  // Create default file if doesn't exist
  const fileExists = await fileExistsAtPath(mcpSettingsFilePath)
  if (!fileExists) {
    await fs.writeFile(
      mcpSettingsFilePath,
      `{
  "mcpServers": {
    
  }
}`,
    )
  }
  return mcpSettingsFilePath
}
```

Configuration changes trigger automatic updates:

```typescript
private async watchMcpSettingsFile(): Promise<void> {
  const settingsPath = await this.getMcpSettingsFilePath()
  this.disposables.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (arePathsEqual(document.uri.fsPath, settingsPath)) {
        // Read, validate, and apply changes
        const content = await fs.readFile(settingsPath, "utf-8")
        // ...
        await this.updateServerConnections(result.data.mcpServers || {})
      }
    })
  )
}
```

## Tool Management

### Tool Discovery

Roo-Code automatically discovers tools provided by connected MCP servers:

```typescript
private async fetchToolsList(serverName: string): Promise<McpTool[]> {
  try {
    const response = await this.connections
      .find((conn) => conn.server.name === serverName)
      ?.client.request({ method: "tools/list" }, ListToolsResultSchema)

    // Get always allow settings
    const settingsPath = await this.getMcpSettingsFilePath()
    const content = await fs.readFile(settingsPath, "utf-8")
    const config = JSON.parse(content)
    const alwaysAllowConfig = config.mcpServers[serverName]?.alwaysAllow || []

    // Mark tools as always allowed based on settings
    const tools = (response?.tools || []).map((tool) => ({
      ...tool,
      alwaysAllow: alwaysAllowConfig.includes(tool.name),
    }))

    console.log(`[MCP] Fetched tools for ${serverName}:`, tools)
    return tools
  } catch (error) {
    return []
  }
}
```

### Tool Authorization Management

Tools can be configured for automatic approval:

```typescript
public async toggleToolAlwaysAllow(serverName: string, toolName: string, shouldAllow: boolean): Promise<void> {
  try {
    const settingsPath = await this.getMcpSettingsFilePath()
    const content = await fs.readFile(settingsPath, "utf-8")
    const config = JSON.parse(content)

    // Initialize alwaysAllow if it doesn't exist
    if (!config.mcpServers[serverName].alwaysAllow) {
      config.mcpServers[serverName].alwaysAllow = []
    }

    const alwaysAllow = config.mcpServers[serverName].alwaysAllow
    const toolIndex = alwaysAllow.indexOf(toolName)

    if (shouldAllow && toolIndex === -1) {
      // Add tool to always allow list
      alwaysAllow.push(toolName)
    } else if (!shouldAllow && toolIndex !== -1) {
      // Remove tool from always allow list
      alwaysAllow.splice(toolIndex, 1)
    }

    // Write updated config back to file
    await fs.writeFile(settingsPath, JSON.stringify(config, null, 2))

    // Update the tools list to reflect the change
    const connection = this.connections.find((conn) => conn.server.name === serverName)
    if (connection) {
      connection.server.tools = await this.fetchToolsList(serverName)
      await this.notifyWebviewOfServerChanges()
    }
  } catch (error) {
    console.error("Failed to update always allow settings:", error)
    vscode.window.showErrorMessage("Failed to update always allow settings")
    throw error // Re-throw to ensure the error is properly handled
  }
}
```

### Tool Execution

Tool execution is handled through the MCP protocol, with support for timeouts:

```typescript
async callTool(
  serverName: string,
  toolName: string,
  toolArguments?: Record<string, unknown>,
): Promise<McpToolCallResponse> {
  const connection = this.connections.find((conn) => conn.server.name === serverName)
  if (!connection) {
    throw new Error(
      `No connection found for server: ${serverName}. Please make sure to use MCP servers available under 'Connected MCP Servers'.`,
    )
  }
  if (connection.server.disabled) {
    throw new Error(`Server "${serverName}" is disabled and cannot be used`)
  }

  let timeout: number
  try {
    const parsedConfig = StdioConfigSchema.parse(JSON.parse(connection.server.config))
    timeout = (parsedConfig.timeout ?? 60) * 1000
  } catch (error) {
    console.error("Failed to parse server config for timeout:", error)
    // Default to 60 seconds if parsing fails
    timeout = 60 * 1000
  }

  return await connection.client.request(
    {
      method: "tools/call",
      params: {
        name: toolName,
        arguments: toolArguments,
      },
    },
    CallToolResultSchema,
    {
      timeout,
    },
  )
}
```

## Resource Management

### Resource Discovery

Roo-Code fetches available resources from each MCP server:

```typescript
private async fetchResourcesList(serverName: string): Promise<McpResource[]> {
  try {
    const response = await this.connections
      .find((conn) => conn.server.name === serverName)
      ?.client.request({ method: "resources/list" }, ListResourcesResultSchema)
    return response?.resources || []
  } catch (error) {
    return []
  }
}
```

### Resource Templates

Resource templates provide parameterized access to dynamic resources:

```typescript
private async fetchResourceTemplatesList(serverName: string): Promise<McpResourceTemplate[]> {
  try {
    const response = await this.connections
      .find((conn) => conn.server.name === serverName)
      ?.client.request({ method: "resources/templates/list" }, ListResourceTemplatesResultSchema)
    return response?.resourceTemplates || []
  } catch (error) {
    return []
  }
}
```

### Resource Access

Resources are accessed through a consistent API:

```typescript
async readResource(serverName: string, uri: string): Promise<McpResourceResponse> {
  const connection = this.connections.find((conn) => conn.server.name === serverName)
  if (!connection) {
    throw new Error(`No connection found for server: ${serverName}`)
  }
  if (connection.server.disabled) {
    throw new Error(`Server "${serverName}" is disabled`)
  }
  return await connection.client.request(
    {
      method: "resources/read",
      params: {
        uri,
      },
    },
    ReadResourceResultSchema,
  )
}
```

## Creating Custom MCP Servers

### Server Requirements

To create a custom MCP server:

1. Implement the Model Context Protocol (see [MCP specification](https://github.com/ModelContext/protocol/blob/main/specification.md))
2. Provide tools and/or resources
3. Handle tool requests and resource access
4. Return properly formatted responses

### Minimal Server Example

Here's a minimal TypeScript MCP server example:

```typescript
import { Server, StdioServerTransport } from "@modelcontextprotocol/sdk/server"

const server = new Server({
  name: "example-server",
  version: "1.0.0",
  capabilities: {
    tools: true,
    resources: true,
  },
})

// Define tools
server.registerTool({
  name: "hello_world",
  description: "A simple hello world tool",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Name to greet" },
    },
    required: ["name"],
  },
  execute: async (params) => {
    const { name } = params
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${name}!`,
        },
      ],
    }
  },
})

// Define resources
server.registerResource({
  uri: "example://data",
  name: "Example Data",
  description: "Example data resource",
  read: async () => {
    return {
      contents: [
        {
          uri: "example://data",
          mimeType: "text/plain",
          text: "Example resource content",
        },
      ],
    }
  },
})

// Start server
const transport = new StdioServerTransport()
server.listen(transport)
```

### Server Configuration

The server should be configured in Roo-Code's MCP settings:

```json
{
  "mcpServers": {
    "example-server": {
      "command": "node",
      "args": ["/path/to/example-server.js"],
      "env": {
        "NODE_ENV": "production"
      },
      "timeout": 30
    }
  }
}
```

## Advanced Integration Patterns

### 1. Database Integration Server

Connect to databases and provide query capabilities:

```typescript
// Server code
server.registerTool({
  name: "execute_query",
  description: "Execute SQL query",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "SQL query to execute" },
    },
    required: ["query"],
  },
  execute: async (params) => {
    const { query } = params
    const results = await database.query(query)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    }
  },
})
```

### 2. API Proxy Server

Create a secure proxy to external APIs:

```typescript
// Server code
server.registerTool({
  name: "fetch_weather",
  description: "Fetch weather data",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string", description: "Location name" },
    },
    required: ["location"],
  },
  execute: async (params) => {
    const { location } = params
    const apiKey = process.env.WEATHER_API_KEY
    const response = await fetch(
      `https://api.weather.com/v1/forecast?location=${encodeURIComponent(location)}&key=${apiKey}`
    )
    const data = await response.json()
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    }
  },
})
```

### 3. Dynamic Resource Templates

Create parameterized resource templates:

```typescript
// Server code
server.registerResourceTemplate({
  uriTemplate: "docs://{topic}",
  name: "Documentation by Topic",
  description: "Access documentation for specific topics",
})

server.handleResourceTemplateRequest(
  "docs://{topic}",
  async (params) => {
    const { topic } = params
    const documentation = await loadDocumentation(topic)
    
    return {
      contents: [
        {
          uri: `docs://${topic}`,
          mimeType: "text/markdown",
          text: documentation,
        },
      ],
    }
  }
)
```

### 4. Context-Aware Tools

Create tools that adapt to the current context:

```typescript
// Server code
server.registerTool({
  name: "analyze_code",
  description: "Analyze code based on context",
  inputSchema: {
    type: "object",
    properties: {
      code: { type: "string", description: "Code to analyze" },
      language: { type: "string", description: "Programming language" },
      context: { type: "string", description: "Analysis context" },
    },
    required: ["code", "language"],
  },
  execute: async (params) => {
    const { code, language, context = "general" } = params
    
    // Select analyzer based on context
    const analyzer = getAnalyzer(language, context)
    const analysis = await analyzer.analyze(code)
    
    return {
      content: [
        {
          type: "text",
          text: analysis,
        },
      ],
    }
  },
})
```

## Security Considerations

### 1. Tool Authorization

Tools should be carefully authorized:

```typescript
// Only add trusted tools to alwaysAllow list
const trustedTools = ["read_data", "simple_transform"]
config.mcpServers["trusted-server"].alwaysAllow = trustedTools
```

### 2. Environment Variables

Sensitive data should be handled securely:

```json
{
  "mcpServers": {
    "api-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "API_KEY": "{{SECRET_VARIABLE}}"
      }
    }
  }
}
```

Note: Real secrets should be stored in a secure manner and not directly in the config file.

### 3. Resource Access Control

Limit resource access to protect sensitive data:

```typescript
// Server code with access control
server.registerResource({
  uri: "data://sensitive",
  name: "Sensitive Data",
  description: "Access controlled data",
  read: async (context) => {
    // Check authorization
    if (!isAuthorized(context)) {
      throw new Error("Unauthorized access")
    }
    
    // Provide data
    return {
      contents: [
        {
          uri: "data://sensitive",
          mimeType: "application/json",
          text: JSON.stringify(sensitiveData),
        },
      ],
    }
  },
})
```

### 4. Input Validation

Validate all inputs to prevent security issues:

```typescript
// Server code with validation
server.registerTool({
  name: "process_data",
  description: "Process user data",
  inputSchema: {
    type: "object",
    properties: {
      data: { type: "string", description: "Data to process" },
      operation: { 
        type: "string", 
        enum: ["summarize", "analyze", "transform"],
        description: "Operation to perform" 
      },
    },
    required: ["data", "operation"],
  },
  execute: async (params) => {
    const { data, operation } = params
    
    // Additional validation beyond schema
    if (data.length > 10000) {
      throw new Error("Data too large")
    }
    
    if (!["summarize", "analyze", "transform"].includes(operation)) {
      throw new Error("Invalid operation")
    }
    
    // Process data...
  },
})
```

## Debugging and Troubleshooting

### Common Issues and Solutions

1. **Connection Failures**
   - Check command path is correct and executable
   - Verify environment variables
   - Check server's stderr output for errors

2. **Tool Execution Timeouts**
   - Increase the timeout value in settings
   - Optimize tool implementation
   - Consider breaking complex operations into smaller steps

3. **Resource Access Errors**
   - Check URI format and parameters
   - Verify server has access to requested resources
   - Look for permission issues in server logs

### Logging and Diagnostics

Roo-Code captures server errors and provides diagnostics:

```typescript
transport.stderr?.on("data", async (data: Buffer) => {
  const errorOutput = data.toString()
  console.error(`Server "${name}" stderr:`, errorOutput)
  const connection = this.connections.find((conn) => conn.server.name === name)
  if (connection) {
    this.appendErrorMessage(connection, errorOutput)
    // Only need to update webview right away if it's already disconnected
    if (connection.server.status === "disconnected") {
      await this.notifyWebviewOfServerChanges()
    }
  }
})
```

Add server-side logging for better diagnostics:

```typescript
// Server-side logging
const log = (level, message, details = {}) => {
  const timestamp = new Date().toISOString()
  console.error(JSON.stringify({
    timestamp,
    level,
    message,
    ...details
  }))
}

server.registerTool({
  name: "example_tool",
  // ...
  execute: async (params) => {
    try {
      log("info", "Tool execution started", { params })
      // Tool implementation...
      log("info", "Tool execution completed")
      return result
    } catch (error) {
      log("error", "Tool execution failed", { 
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }
})
```

## Performance Optimization

### Tool Execution Efficiency

1. **Caching**: Implement response caching for frequently used tools:
   ```typescript
   // Simple in-memory cache
   const cache = new Map()
   
   server.registerTool({
     name: "cached_operation",
     // ...
     execute: async (params) => {
       const cacheKey = JSON.stringify(params)
       if (cache.has(cacheKey)) {
         return cache.get(cacheKey)
       }
       
       // Execute operation...
       const result = { /* ... */ }
       
       cache.set(cacheKey, result)
       return result
     }
   })
   ```

2. **Asynchronous Processing**: For long-running operations, consider async patterns:
   ```typescript
   const operations = new Map()
   
   server.registerTool({
     name: "start_operation",
     // ...
     execute: async (params) => {
       const opId = generateId()
       
       // Start operation in background
       operations.set(opId, {
         status: "running",
         progress: 0
       })
       
       startBackgroundTask(opId, params)
       
       return {
         content: [
           {
             type: "text",
             text: `Operation started with ID: ${opId}`
           }
         ]
       }
     }
   })
   
   server.registerTool({
     name: "check_operation",
     // ...
     execute: async (params) => {
       const { opId } = params
       const operation = operations.get(opId)
       
       if (!operation) {
         throw new Error(`Operation ${opId} not found`)
       }
       
       return {
         content: [
           {
             type: "text",
             text: `Status: ${operation.status}, Progress: ${operation.progress}%`
           }
         ]
       }
     }
   })
   ```

### Resource Optimization

For large resources, consider pagination and streaming:

```typescript
server.registerResourceTemplate({
  uriTemplate: "data://{dataset}/page/{page}",
  name: "Paginated Dataset",
  description: "Access large datasets with pagination",
})

server.handleResourceTemplateRequest(
  "data://{dataset}/page/{page}",
  async (params) => {
    const { dataset, page } = params
    const pageNum = parseInt(page, 10)
    const pageSize = 100
    
    const data = await loadDatasetPage(dataset, pageNum, pageSize)
    const totalPages = await getDatasetPageCount(dataset, pageSize)
    
    return {
      contents: [
        {
          uri: `data://${dataset}/page/${page}`,
          mimeType: "application/json",
          text: JSON.stringify({
            data,
            pagination: {
              page: pageNum,
              pageSize,
              totalPages,
              nextPage: pageNum < totalPages ? pageNum + 1 : null,
              prevPage: pageNum > 1 ? pageNum - 1 : null
            }
          }),
        },
      ],
    }
  }
)
```

## Future Directions

The MCP integration in Roo-Code is being actively developed with several planned enhancements:

1. **Improved Authentication**: More robust authentication options for MCP servers
2. **Bidirectional Communication**: Enhanced real-time updates from servers
3. **Streaming Responses**: Support for long-running operations with progress updates
4. **Template Libraries**: Pre-built server templates for common integration patterns
5. **Visual Server Builder**: GUI for creating and configuring MCP servers

## Conclusion

The Model Context Protocol integration in Roo-Code provides a powerful extension mechanism that enables sophisticated integration with external tools, data sources, and custom capabilities. By understanding the technical implementation details and following the best practices outlined in this guide, you can create robust and secure MCP servers that enhance the capabilities of your AI-powered development environment.