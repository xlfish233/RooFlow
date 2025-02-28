# Context Mentions in Roo-Code

## What Are Context Mentions?

Context mentions are a powerful way to reference specific resources when talking to Roo. By using the `@` symbol followed by a path or keyword, you can point Roo to important information without having to copy and paste content.

Think of mentions as a way to say "look at this" to Roo - they save time and help Roo understand exactly what you're talking about.

## Types of Mentions You Can Use

### File and Folder Mentions

To reference a specific file:
```
@/path/to/file.js
```

For example:
```
Can you explain how @/src/utils.js works?
```

To reference a folder:
```
@/src/components
```

For example:
```
What files are in @/src/components?
```

### Git Mentions

To reference a specific Git commit:
```
@commitHash
```

For example:
```
What changes were made in commit @a1b2c3d?
```

To reference uncommitted changes:
```
@git-changes
```

For example:
```
Can you review my changes in @git-changes?
```

### Problems Mention

To reference current problems (errors, warnings):
```
@problems
```

For example:
```
Can you help me fix the issues in @problems?
```

### Terminal Mention

To reference recent terminal output:
```
@terminal
```

For example:
```
What's wrong with this error in @terminal?
```

## How Mentions Make Your Work Easier

### Save Time and Effort

Instead of copying and pasting large blocks of code or error messages, you can simply use a mention. This is especially helpful for:

- Long code files
- Complex error messages
- Directory structures
- Git diffs

### Provide Complete Context

Mentions help Roo understand the full context of your request, leading to better responses. When you reference a file, Roo can see its content, structure, and relationship to other files.

### Use Multiple Mentions Together

You can use multiple mentions in a single message to provide comprehensive context:

```
How are @/src/utils.js and @/src/helpers.js different?
```

```
I'm getting an error with this function in @/src/auth.js when I run the tests. Can you look at @terminal and help me fix it?
```

## Best Practices for Using Mentions

### Be Specific

Reference exactly what you need:
- Use specific file paths rather than entire directories when possible
- For large files, mention specific line numbers when relevant
- Clear your terminal before capturing output you want to reference

### Combine Different Mention Types

Use different mention types together for comprehensive context:

```
I'm trying to fix the issues in @problems related to @/src/api/client.js. 
The error shows up in @terminal when I run the tests.
```

### Watch Your Context Size

Remember that each mention adds content to your conversation with Roo:
- Be selective with large files or numerous mentions
- For very large files, consider mentioning just the relevant sections

## Practical Use Cases

### Code Review

```
Can you review the changes in @git-changes and suggest any improvements?
```

This lets Roo see all your uncommitted changes without you having to paste them.

### Debugging

```
I'm getting this error in @terminal when running the app. The code is in @/src/app.js. What's wrong?
```

This gives Roo both the error message and the related code.

### Learning and Understanding

```
I'm new to this project. Can you explain how @/src/main.js works and what it does?
```

This helps Roo provide a detailed explanation of the file's purpose and structure.

### Problem Solving

```
I need to implement a new feature that works with @/src/api/users.js. Can you help me design it?
```

This gives Roo the context of the existing code to suggest compatible features.

## Tips for Effective Mentions

1. **Check the path**: Make sure file paths are correct before mentioning them
2. **Be patient with large files**: Larger files take more time to process
3. **Mention related files**: Include all files relevant to your question
4. **Use short commit hashes**: For git commits, the short hash (7-8 characters) is usually sufficient
5. **Clear terminal when needed**: Clear your terminal before running commands if you only want to see new output when using `@terminal`