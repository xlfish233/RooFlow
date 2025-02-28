# Custom Rules in Roo-Code

## What Are Custom Rules?

Custom rules tell Roo how to behave when helping with your projects. They're similar to guidelines you might give to a team member about your project's standards and practices.

By creating rule files, you can ensure Roo follows your coding style, adheres to your project's requirements, and maintains consistency across all its suggestions.

## Benefits of Custom Rules

- Ensure consistent coding style across your project
- Enforce important practices like security standards
- Maintain quality through testing and documentation requirements
- Reduce back-and-forth by teaching Roo your preferences up front

## Types of Rule Files

Roo-Code supports several rule file formats that you can place in your project's root directory:

| File Name | Purpose |
|-----------|---------|
| `.clinerules` | Main rule file for all modes |
| `.clinerules-code` | Rules specific to Code mode |
| `.clinerules-architect` | Rules specific to Architect mode |
| `.clinerules-[mode]` | Rules for any custom mode |

## How to Create Rule Files

Rule files use a simple markdown format that's easy to write:

```
# Category Title

1. Rule Group Title:
   - Specific guideline
   - Another guideline
   - Technical requirement

2. Another Rule Group:
   - Guideline one
   - Guideline two
```

For example, a basic code style rule file might look like:

```
# Code Style Rules

1. Formatting:
   - Use 2-space indentation
   - Limit line length to 100 characters
   - Place opening braces on the same line

2. Naming:
   - Use camelCase for variables and functions
   - Use PascalCase for classes
   - Use UPPER_SNAKE_CASE for constants
```

## Global vs. Mode-Specific Rules

You can create both global rules and mode-specific rules:

- **Global Rules** (`.clinerules`) apply to all modes
- **Mode-Specific Rules** (`.clinerules-[mode]`) only apply when using that specific mode

When both exist, mode-specific rules take priority, but global rules still apply if they don't conflict.

## NEW: Custom System Prompts

### What Are Custom System Prompts?

Custom system prompts are a new feature that gives you even more control than custom rules. While custom rules add guidelines to Roo's behavior, custom system prompts let you completely replace Roo's underlying instructions.

### How to Create a Custom System Prompt

1. Create a `.roo` folder in your project's root directory
2. Create a file named `system-prompt-[mode]` inside that folder
   - For example: `.roo/system-prompt-code` for Code mode
3. Write your custom instructions in that file

The folder and files will be created automatically when needed.

### When to Use Rules vs. System Prompts

**Use Custom Rules when you want to:**
- Keep all of Roo's standard capabilities
- Add specific guidelines for your project
- Make simple adjustments to Roo's behavior

**Use Custom System Prompts when you need:**
- Complete control over how Roo behaves
- Very specialized behavior for specific tasks
- To override Roo's default capabilities

You can use both together for maximum customization - the system prompt provides the foundation, and custom rules add specific guidelines.

## Example Rule Categories

### Code Style Rules

```
# Code Style

1. Formatting:
   - Use consistent indentation (tabs or spaces)
   - Keep line length under 100 characters
   - Use descriptive variable names

2. File Organization:
   - Group related functions together
   - Place imports at the top of the file
   - Order methods logically
```

### Testing Rules

```
# Testing Requirements

1. Test Coverage:
   - Write tests for all new functions
   - Maintain at least 80% code coverage
   - Test both success and error cases

2. Test Structure:
   - Name tests descriptively
   - Organize by feature or component
   - Test edge cases explicitly
```

## Best Practices for Rule Files

### 1. Be Clear and Specific

Write clear, actionable guidelines rather than vague principles:

**Good:**
```
- Validate all user inputs before processing
- Log all errors with stack traces
- Include unit tests for edge cases
```

**Not as helpful:**
```
- Be secure
- Handle errors properly
- Test thoroughly
```

### 2. Organize Logically

Group related rules together under clear categories:

```
# Security

1. Input Validation:
   - Validate all user inputs
   - Sanitize data before use
   - Reject unexpected values

2. Authentication:
   - Require secure passwords
   - Implement account lockouts
   - Log authentication attempts
```

### 3. Keep Rules Updated

Review and update your rules as your project evolves:

- Remove outdated guidelines
- Add rules for new technologies
- Refine based on project learnings

## Combining Rules with Custom Modes

For an even more tailored experience, you can:

1. Create a custom mode with specific capabilities
2. Create matching `.clinerules-[mode]` file
3. Add a custom system prompt in `.roo/system-prompt-[mode]` if needed

This combination gives you complete control over Roo's capabilities and behavior for specific tasks.