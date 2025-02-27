# Custom Rules in Roo-Code: Technical Guide

## Overview

The custom rules system in Roo-Code provides a powerful mechanism for defining specific guidelines, constraints, and behaviors that the AI assistant should follow when working with your codebase. This technical guide explores the implementation details, configuration options, and advanced usage patterns for custom rules.

## Technical Implementation

### Rule File Loading Process

The rule loading process is implemented in `src/core/prompts/sections/custom-instructions.ts`. The system supports multiple rule file formats and implements a hierarchical loading strategy:

```typescript
export async function loadRuleFiles(cwd: string): Promise<string> {
  const ruleFiles = [".clinerules", ".cursorrules", ".windsurfrules"]
  let combinedRules = ""

  for (const file of ruleFiles) {
    const content = await safeReadFile(path.join(cwd, file))
    if (content) {
      combinedRules += `\n# Rules from ${file}:\n${content}\n`
    }
  }

  return combinedRules
}
```

This function scans the project root directory for any of the supported rule file formats and combines their contents into a single string. The `safeReadFile` function handles errors gracefully, allowing the system to continue even if some rule files are missing.

### Rule Application Hierarchy

Rules are applied in a specific order, with mode-specific rules taking precedence over global rules:

```typescript
// Add mode-specific rules first if they exist
if (modeRuleContent && modeRuleContent.trim()) {
  const modeRuleFile = `.clinerules-${mode}`
  rules.push(`# Rules from ${modeRuleFile}:\n${modeRuleContent}`)
}

// Add generic rules
const genericRuleContent = await loadRuleFiles(cwd)
if (genericRuleContent && genericRuleContent.trim()) {
  rules.push(genericRuleContent.trim())
}

if (rules.length > 0) {
  sections.push(`Rules:\n\n${rules.join("\n\n")}`)
}
```

This hierarchical approach allows for:
1. Global rules that apply to all modes (`.clinerules`)
2. Mode-specific rules that only apply to a particular mode (`.clinerules-{mode}`)
3. Alternative rule file formats for compatibility (`.cursorrules`, `.windsurfrules`)

### Integration with System Prompt

Rules are integrated into the LLM's system prompt through a dedicated section:

```typescript
const joinedSections = sections.join("\n\n")

return joinedSections
  ? `
====

USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

${joinedSections}`
  : ""
```

This ensures that the rules are clearly delineated in the system prompt and presented as user-provided instructions that the LLM should follow.

## Rule Format and Structure

### Markdown-Based Format

Rules are written in Markdown, which provides a clean, hierarchical format:

```markdown
# Category Title

1. Rule Group Title:
   - Specific guideline
   - Another guideline
   - Technical requirement

2. Another Rule Group:
   - Guideline one
   - Guideline two
```

This format offers several advantages:
- Easy to read and write for humans
- Natural hierarchical organization
- Support for rich formatting
- Compatibility with existing documentation standards

### Example Rule Categories

#### Code Style Rules

```markdown
# Code Style Rules

1. Formatting:
   - Use 2-space indentation for all files
   - Limit line length to 100 characters
   - Place opening braces on the same line
   - Use trailing commas in multi-line arrays and objects

2. Naming Conventions:
   - Use camelCase for variables and functions
   - Use PascalCase for classes and types
   - Use UPPER_SNAKE_CASE for constants
   - Prefix private methods with underscore
```

#### Security Rules

```markdown
# Security Rules

1. Input Validation:
   - Validate all user inputs before processing
   - Use parameterized queries for database operations
   - Sanitize HTML output to prevent XSS attacks
   - Validate file uploads and limit file types

2. Authentication:
   - Implement proper authentication checks on all API endpoints
   - Use secure password hashing (bcrypt) for password storage
   - Implement proper session management and token validation
   - Never store sensitive information in client-side code
```

## Mode-Specific Rules Integration

Mode-specific rules are a powerful feature that allows tailoring the AI's behavior to specific operational contexts. Each mode can have its own dedicated rule file named `.clinerules-{mode}`.

### Technical Implementation

When the system initializes a conversation in a specific mode, it looks for a corresponding rule file:

```typescript
// Load mode-specific rules if mode is provided
let modeRuleContent = ""
if (mode) {
  const modeRuleFile = `.clinerules-${mode}`
  modeRuleContent = await safeReadFile(path.join(cwd, modeRuleFile))
}
```

If found, these rules take precedence in the prompt construction:

```typescript
// Add mode-specific rules first if they exist
if (modeRuleContent && modeRuleContent.trim()) {
  const modeRuleFile = `.clinerules-${mode}`
  rules.push(`# Rules from ${modeRuleFile}:\n${modeRuleContent}`)
}
```

### Mode-Specific Rule Examples

#### Architect Mode Rules

```markdown
# Architect Mode Rules

1. Design Principles:
   - Follow Domain-Driven Design principles
   - Maintain clear separation of concerns
   - Prioritize interfaces over implementations
   - Design for extensibility and maintainability

2. Documentation Requirements:
   - Document all architectural decisions
   - Include rationale for design choices
   - Specify interfaces between components
   - Create system diagrams for complex features
```

#### Code Mode Rules

```markdown
# Code Mode Rules

1. Implementation Standards:
   - Write unit tests for all new code
   - Maintain 80%+ test coverage
   - Handle edge cases explicitly
   - Include error handling for all external operations

2. Performance Requirements:
   - Optimize database queries for large datasets
   - Implement pagination for list endpoints
   - Use caching for frequently accessed data
   - Profile code for performance bottlenecks
```

## Integration with Custom Modes

The rules system integrates seamlessly with custom modes, creating a powerful combination:

1. **Custom Mode Definition**: Define a mode with specific tool permissions
2. **Mode-Specific Rules**: Create corresponding `.clinerules-{mode}` file
3. **Combined Behavior**: The AI follows both the mode's role definition and the specific rules

Example:

```json
// Custom mode definition in .roomodes
{
  "customModes": [
    {
      "slug": "security-auditor",
      "name": "Security Auditor",
      "roleDefinition": "You are Roo, a security-focused code auditor specialized in identifying vulnerabilities and suggesting secure coding practices.",
      "groups": [
        "read",
        "edit"
      ]
    }
  ]
}
```

Paired with:

```markdown
# .clinerules-security-auditor

1. Vulnerability Assessment:
   - Check for SQL injection vectors in database queries
   - Identify possible XSS vulnerabilities in HTML rendering
   - Look for insecure direct object references
   - Check for proper input validation

2. Reporting Standards:
   - Classify issues by severity (Critical, High, Medium, Low)
   - Provide specific code locations for each finding
   - Include remediation suggestions with examples
   - Reference OWASP Top 10 or CWE IDs when applicable
```

## Advanced Implementation Details

### File Reading Safety

The rule loading system uses a safe file reading function that gracefully handles missing files and other errors:

```typescript
async function safeReadFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf-8")
    return content.trim()
  } catch (err) {
    const errorCode = (err as NodeJS.ErrnoException).code
    if (!errorCode || !["ENOENT", "EISDIR"].includes(errorCode)) {
      throw err
    }
    return ""
  }
}
```

This ensures that:
- Missing rule files don't cause errors
- Only expected error types are silently handled
- Unexpected errors propagate for proper handling

### Rule Formatting

Rules are carefully formatted in the system prompt to ensure clear separation and proper attribution:

```typescript
if (rules.length > 0) {
  sections.push(`Rules:\n\n${rules.join("\n\n")}`)
}
```

Each rule set includes a header indicating its source:

```
# Rules from .clinerules-code:
[Content of code-specific rules]

# Rules from .clinerules:
[Content of global rules]
```

This helps the LLM understand the hierarchy and origin of different rule sets.

## Best Practices for Rule Creation

### 1. Be Specific and Clear

Rules should be specific, clear, and actionable:

```markdown
# Good Example
1. Error Handling:
   - Wrap all database operations in try/catch blocks
   - Log errors with stack traces and context information
   - Provide user-friendly error messages without exposing system details
   - Implement graceful degradation for non-critical failures
```

```markdown
# Bad Example
1. Error Handling:
   - Handle errors properly
   - Make sure errors are logged
   - Don't show bad errors to users
```

### 2. Organize Hierarchically

Use a clear hierarchical structure:
- Use headings for major categories
- Use numbered lists for rule groups
- Use bullet points for specific guidelines

```markdown
# Testing Requirements

1. Unit Tests:
   - Write tests for all new functions
   - Maintain at least 80% code coverage
   - Test edge cases and error conditions

2. Integration Tests:
   - Test API endpoints with real data
   - Verify database operations
   - Test authentication flows
```

### 3. Focus on Guidelines, Not Commands

Rules should establish guidelines rather than prescribe specific commands:

```markdown
# Good Example
1. Logging:
   - Use structured logging with consistent fields
   - Include correlation IDs for request tracing
   - Log meaningful events at appropriate levels
```

```markdown
# Bad Example
1. Logging:
   - Use logger.info("Starting process")
   - Add try/catch and call logger.error(err)
```

### 4. Align with Project Standards

Rules should reflect your project's actual standards and practices:

- Review existing code for patterns to codify
- Ensure rules match your team's agreed practices
- Update rules as project standards evolve

## Practical Applications

### 1. Consistent Code Quality

Rules can enforce consistent code quality standards:

```markdown
# Code Quality Rules

1. Test Coverage:
   - Write unit tests for all new functions
   - Maintain at least 80% code coverage
   - Test both success and error paths

2. Documentation:
   - Document all public APIs with JSDoc
   - Include examples for complex functions
   - Document all configuration options
```

### 2. Security Compliance

Rules can ensure security practices are followed:

```markdown
# Security Rules

1. Data Protection:
   - Never log sensitive personal data
   - Encrypt all PII at rest and in transit
   - Implement proper data access controls
   - Follow GDPR/CCPA data handling requirements
```

### 3. Team Conventions

Rules can codify team-specific conventions:

```markdown
# Team Conventions

1. Git Workflow:
   - Keep commits focused on single concerns
   - Write descriptive commit messages
   - Reference issue numbers in commits
   - Squash commits before merging
```

## Conclusion

The custom rules system in Roo-Code provides a powerful and flexible way to tailor the AI's behavior to your specific project requirements and team conventions. By understanding the technical implementation and following best practices for rule creation, you can create a more effective and consistent development experience with Roo-Code.

When combined with custom modes, rule files create a comprehensive system for defining both the capabilities and behavioral guidelines for AI-assisted development, ensuring that the assistance you receive aligns perfectly with your project's needs.