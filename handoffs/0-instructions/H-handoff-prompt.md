# Handoff Review Prompt Template

When transitioning to a new LLM session during ongoing work, use this prompt to efficiently transfer all project progress through the handoff documents.

## Template

```
Before we begin, please:

1. Review the handoffs/ directory for all numbered handoff documents
2. Read ALL handoff documents in chronological order (from lowest number to highest)
   For example: 1-setup.md, 2-implementation.md, 3-fixes.md, etc.
3. Pay attention to all sections to understand the project history and current state

After reading, please:
- Tell me the number and filenames of handoff documents you've read
- Confirm with: "I have reviewed all handoff documents and am ready for your instructions."

Please refrain from providing analysis or suggestions until requested, as I'd prefer to guide our next steps together after you've absorbed the context.

I will provide specific instructions on how to proceed after you confirm reading the documents.
```

## Purpose

This prompt ensures that:

1. The LLM reads ALL handoff documents in proper chronological sequence
2. The LLM gains full context of the project without jumping ahead
3. The verification confirms proper reading
4. You maintain control over how the project proceeds

## Usage

Paste this prompt at the beginning of a new LLM session when you need to continue work on a project. This gives the new LLM instance the full project context through the handoff documents while keeping the focus on your guidance for next steps.

After the LLM confirms reading the documents, you can then direct it with specific instructions on how to proceed.

## When To Use

Use this prompt when:
- You need to switch to a fresh LLM session to continue project work
- You want the LLM to understand the complete project evolution
- You haven't created milestone documents yet, or need more detailed context than milestones provide
- You want to maintain control over project direction after the knowledge transfer