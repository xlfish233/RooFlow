# Managing the Context Window in Roo-Code

## What is the Context Window?

The context window is like Roo's working memory - it's how much information Roo can keep in mind at once. This includes your conversation, the code you're discussing, and all the background knowledge Roo needs to help you.

When the context window fills up, Roo may need to forget older parts of your conversation to make room for new information. Understanding how to manage this space helps you get the most out of Roo.

## Features That Affect Context Size

### Open Files

**Setting**: `maxOpenTabsContext`

This controls how many of your open editor tabs Roo includes in its context:
- **Higher values** (10-20): Roo knows about more of your open files
- **Lower values** (1-5): Roo focuses on fewer files, saving context space
- **Zero**: Roo doesn't automatically include open files

**When to adjust**: Increase when working across many related files, decrease when focusing on one task or when conversations get long.

### Terminal Output

**Setting**: `terminalOutputLineLimit`

This limits how much terminal output Roo can see when you use `@terminal`:
- **Higher values** (100+): Roo sees more output lines
- **Lower values** (20-50): Roo sees less output, saving context space

**When to adjust**: Increase when debugging complex build or error output, decrease for general work.

### Conversation Management

As your conversation with Roo grows, it uses more of the context window. Roo handles this by:
- Keeping your most recent messages
- Potentially removing older messages when needed
- Always remembering its core instructions

**What you can do**:
- Start new conversations for different topics
- Break complex tasks into smaller conversations
- Keep questions and instructions focused

### Experimental Features

#### Power Steering

This feature makes Roo follow instructions more precisely by reminding it about them more often.

**Impact on context**: Uses significantly more context space
**When to use**: When precise adherence to guidelines is more important than context space

## Practical Strategies

### 1. Be Selective With File References

When referencing files:
- Mention specific files rather than entire folders
- Point to relevant sections instead of whole files
- Use `@/path/to/file.js:10-20` to reference specific lines

### 2. Optimize Open Tabs

Before starting complex tasks:
- Close unnecessary tabs
- Keep open only the files you're actively discussing
- Adjust the `maxOpenTabsContext` setting based on your current task

### 3. Clear Terminal When Needed

- Clear your terminal before running important commands
- This ensures `@terminal` captures only relevant output
- Use smaller output limits for routine tasks

### 4. Use Mode Selection Strategically

Different modes include different tools in Roo's knowledge:
- **Ask mode**: Minimal tool knowledge, more space for answers
- **Code mode**: Complete coding tool knowledge, less space for long conversations
- **Custom modes**: Can be tailored to include only what you need

### 5. Monitor Context Usage

Pay attention to the context usage indicator in Roo-Code:
- If it's approaching the limit, consider starting a new conversation
- Watch for warnings about context limitations
- If Roo seems to "forget" earlier parts of your conversation, the context may be full

### 6. Disable Unnecessary Features

When you need maximum context space:
- Disable Power Steering in experimental features
- Turn off MCP if you're not using custom servers
- Adjust other features that might be consuming space

## Example Configurations

### For Understanding Large Codebases

```
Recommended settings:
- maxOpenTabsContext: 15-20
- terminalOutputLineLimit: 20
- Power Steering: Disabled
```

This configuration helps Roo understand your project structure by including many files, while limiting other context usage.

### For In-depth Problem Solving

```
Recommended settings:
- maxOpenTabsContext: 3-5
- terminalOutputLineLimit: 100
- Power Steering: Disabled
```

This focuses on fewer files but includes more terminal output for debugging errors and issues.

### For Following Strict Guidelines

```
Recommended settings:
- maxOpenTabsContext: 5-8
- terminalOutputLineLimit: 30
- Power Steering: Enabled
```

This balances file context with Power Steering's enhanced instruction adherence.

## Tips for Common Tasks

### Debugging Complex Issues

1. Clear your terminal
2. Run commands that produce the error
3. Reference with `@terminal`
4. Include only the most relevant files with `@/path/to/file.js`
5. Consider temporarily increasing the terminal output limit

### Code Review

1. Close unrelated tabs
2. Use `@git-changes` to reference your changes
3. Ask focused questions about specific parts
4. Start new conversations for different aspects of the review

### Learning a New Codebase

1. Increase the `maxOpenTabsContext` setting
2. Ask about project structure first
3. Then focus on specific areas of interest
4. Use directories first, then drill down to specific files

## Conclusion

Managing the context window effectively helps you get the most out of Roo-Code. By understanding how different features affect context usage and adopting smart strategies, you can have more productive, focused conversations with Roo.

Remember that context management involves trade-offs - more space for code means less for conversation history, and vice versa. The best approach depends on your specific task and preferences.