# Custom Rules in Roo-Code

## What Are Custom Rules?

Custom rules are guidelines that tell Roo how to behave when helping you with your projects. They're like instructions you might give to a new team member about your project's standards and practices.

With custom rules, you can ensure Roo follows your coding style, adheres to your project's requirements, and maintains consistency in all its suggestions.

## Why Use Custom Rules?

Custom rules help you:

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

Rule files use a simple format that's easy to write:

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

Roo-Code allows you to create both global rules and mode-specific rules:

- **Global Rules** (`.clinerules`) apply to all modes
- **Mode-Specific Rules** (`.clinerules-[mode]`) only apply when using that specific mode

When both exist, mode-specific rules take priority, but global rules still apply if they don't conflict.

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

### Documentation Rules

```
# Documentation Standards

1. Code Documentation:
   - Document all public functions
   - Explain complex algorithms
   - Include examples for APIs

2. Project Documentation:
   - Keep README up-to-date
   - Document setup steps
   - Include troubleshooting guidance
```

## Using Rules with Different Modes

Different modes in Roo-Code handle different types of tasks. You can create specialized rules for each:

### Code Mode Rules (`.clinerules-code`)

Focus on implementation details:
- Coding standards
- Testing requirements
- Error handling practices

### Architect Mode Rules (`.clinerules-architect`)

Focus on design and structure:
- Design patterns to follow
- System organization principles
- Interface design guidelines

### Debug Mode Rules (`.clinerules-debug`)

Focus on problem-solving:
- Debugging approaches
- Logging requirements
- Test case creation

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

### 3. Prioritize Important Rules

Put the most important rules first:

```
# Performance

1. Critical Paths:
   - Optimize database queries
   - Cache frequently accessed data
   - Minimize network requests

2. General Optimizations:
   - Use efficient algorithms
   - Minimize DOM manipulations
   - Implement lazy loading
```

### 4. Keep Rules Updated

Review and update your rules as your project evolves:

- Remove outdated guidelines
- Add rules for new technologies
- Refine based on project learnings

## Practical Examples

### Web Development Project

```
# Web Project Rules

1. Accessibility:
   - Use semantic HTML elements
   - Include alt text for images
   - Ensure keyboard navigation works
   - Maintain WCAG AA compliance

2. Performance:
   - Keep bundle size under 500KB
   - Optimize images before adding
   - Implement code splitting
   - Lazy load non-critical resources
```

### Data Science Project

```
# Data Science Rules

1. Data Management:
   - Document data sources
   - Version control datasets
   - Include data cleaning steps
   - Note missing value handling

2. Models:
   - Document training parameters
   - Include accuracy metrics
   - Validate against test data
   - Explain feature importance
```

## Combining Rules with Custom Modes

For an even more tailored experience, you can:

1. Create a custom mode with specific capabilities
2. Create matching `.clinerules-[mode]` file
3. Get specialized assistance that follows your guidelines

By using custom rules effectively, you can transform Roo into a team member who understands and follows your project's unique needs and standards.