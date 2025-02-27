# Creating a Handoff Document

Use this prompt when you need to create a new handoff document to capture your current progress.

## Simple Prompt Template

```
I need to create a handoff document for our current work. Please:

1. Read the docs/handoffs/0-instructions/1-handoff-instructions.md
2. Determine the next sequential handoff number by examining ONLY the handoffs/ root directory
3. Create a properly structured handoff file with that number
```

That's it! The LLM will:
- Examine the handoffs/ directory to find the next number
- Create a properly formatted handoff document following all guidelines
- Include all required sections with appropriate content based on your conversation history

## Optional Context

If you want to provide specific guidance, you can add:

```
Use today's date and focus on [SPECIFIC TOPIC].
```

## Purpose

This minimal prompt allows the LLM to handle all the details of:
- Finding the correct sequential number
- Creating the file in the correct location
- Following the proper format
- Filling in appropriate content based on context

The goal is to make creating handoffs as simple as possible while letting the LLM do the work.