# Creating a Milestone

Use this prompt when you need to create a new milestone to consolidate accumulated handoffs.

## Simple Prompt Template

```
I need to create a milestone for our completed [FEATURE/COMPONENT]. Please:

1. Read the docs/handoffs/0-instructions/2-milestone-instructions.md
2. Determine the next sequential milestone number by examining existing milestone directories
3. Create the milestone directory with that number
4. Move all numbered handoff documents from the handoffs/ root into this milestone directory
5. Create the required 0-milestone-summary.md and 0-lessons-learned.md files
```

That's it! The LLM will:
- Examine the existing milestone directories to find the next number
- Create a properly structured milestone directory
- Move all handoff files from the root directory into the milestone
- Create the required summary documents with appropriate content

## Purpose

This minimal prompt allows the LLM to handle all the details of:
- Finding the correct sequential number for the milestone
- Creating the directory in the correct location
- Moving the handoff files
- Creating properly formatted summary documents

## Script Availability

The LLM knows about the available scripts for automating milestone creation. If you prefer to use a specific script, just mention your preferred language:

```
Use the Python script to create the milestone.
```

or

```
Use the Bash script to create the milestone.
```

or 

```
Use the Node.js script to create the milestone.