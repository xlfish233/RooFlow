# Conversation Extraction Tools for Roo-Code

This repository contains two script implementations for cleaning and extracting essential conversation content from Roo-Code prompt history exports. These tools help remove unnecessary technical details, file contents, and other elements while preserving the valuable conversation flow and thinking process.

## Purpose

When exporting conversations from Roo-Code, the resulting Markdown files often contain:

- File contents that are already available in your project directory
- Code snippets that may introduce bias when reused with LLMs
- Technical details that make the conversation harder to follow
- Tool usage references that aren't relevant to the core discussion

These scripts clean the conversation exports to create a more focused and useful reference document.

## Available Implementations

### Python Implementation (`extract_conversation_simple.py`)

- **Language**: Python 3.x+
- **Size Reduction**: ~90% (28,150 bytes from a 276,595 byte original)
- **Strengths**: More aggressive cleaning, better handling of Unicode, slightly better regular expressions

### JavaScript Implementation (`extract_conversation.js`)

- **Language**: Node.js
- **Size Reduction**: ~80% (55,330 bytes from a 276,595 byte original)
- **Strengths**: No external dependencies, runs in any Node.js environment, similar cleaning patterns

## Key Differences

| Feature | Python Version | JavaScript Version |
|---------|---------------|-------------------|
| Performance | Slightly better cleaning | Good cleaning |
| External Dependencies | None | None |
| Implementation | Uses Python regex engine | Uses JavaScript regex engine |
| Pattern Handling | More aggressive whitespace cleanup | Standard whitespace handling |
| Efficiency | Typically produces smaller output files | Slightly larger output files |

## Usage

Both scripts share the same command-line interface:

### Python Version

```bash
python extract_conversation_simple.py input_file [output_file]
```

### JavaScript Version

```bash
node extract_conversation.js input_file [output_file]
```

If no output file is specified, both scripts automatically create a new file with "_clean" appended to the original filename.

## What Gets Preserved

Both scripts carefully preserve:

- User prompts and questions
- Assistant responses and explanations
- Thinking sections that show reasoning process
- Core conversation flow and context

## What Gets Removed

The scripts remove:

- File contents (which are already available in your project)
- Tool use details (replaced with the essential information)
- Environment details and system information
- Duplicated content and redundant messages
- Code blocks and file listings
- Line numbers and file path references

## Roo-Code Compatibility

Both scripts are specifically optimized for Roo-Code's export format:

- They handle "**User:**" and "**Assistant:**" headers with messages separated by "---"
- They recognize and process Roo-Code's tool formatting like `[Tool Use: tool_name]`, `[Tool]`, and `[Image]` references
- They maintain the markdown structure while removing unnecessary details

## Example

**Original Export Snippet**:
```
**User:**

Let's create a simple login form.

**Assistant:**

<thinking>
Let me create a simple login form with HTML, CSS, and maybe some basic JavaScript validation. I'll need:
1. HTML for structure
2. CSS for styling
3. JavaScript for validation
</thinking>

I'll create a simple login form for you:

<write_to_file>
<path>login.html</path>
<content>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Form</title>
    <style>
        /* CSS styles here */
    </style>
</head>
<body>
    <!-- Form content here -->
</body>
</html>