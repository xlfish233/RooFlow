# Handoff Review Prompt Template

When transitioning to a new LLM session during ongoing work, use this prompt to efficiently transfer all project progress through the handoff documents.

## Template

```
Before we begin, please:

1. Review all milestone directories in the handoffs/ folder
2. Read ONLY the 0-prefixed documents (such as 0-milestone-summary.md and 0-lessons-learned.md) in each milestone directory
3. DO NOT read any documents with numeric prefixes higher than 0 (such as 1-*, 2-*, etc.)
4. Read these milestone summaries in sequential order from earliest to most recent

After reading, please tell me:
- The exact number of 0-prefixed documents you've read
- The milestone directories you found (list them with their numbers and names)
- A brief 1-2 sentence summary of each milestone's key achievements

This will ensure you have the condensed project context without consuming unnecessary tokens.

Next, 

1. Review the handoffs/ directory for all numbered handoff documents
2. Read ALL handoff documents in chronological order (from lowest number to highest)
   For example: 1-setup.md, 2-implementation.md, 3-fixes.md, etc.
3. Pay attention to all sections to understand the project history and current state

Finally, read the README.md and [insert custom instructions here]
```

If you want advice, add something like: 

```
And help me determine the next step.
```

If you know what you're doing you can add something like this to speed it up:

```
After reading, please:
- Tell me the number and filenames of handoff documents you've read
- List them in numerical order (e.g., "1-setup.md, 2-implementation.md, 3-fixes.md")
- Confirm with: "I have reviewed all handoff documents and am ready for your instructions."

Please refrain from providing analysis or suggestions until requested, as I'd prefer to guide our next steps together after you've absorbed the context.

I will provide specific instructions on how to proceed after you confirm reading the documents.
```

## Introspection Reminder

When continuing the project after reviewing handoffs, remember these guidelines for when to create new handoffs:

- After 10+ conversation exchanges
- When context becomes ~30% irrelevant to current task
- After completing a significant project segment
- During debugging sessions exceeding 5 exchanges without resolution

For best results, switch to the "handoff-manager" custom mode when creating handoff documents, and "milestone-manager" custom mode when creating milestone summaries.

## Purpose

This prompt ensures that:

1. The LLM reads ALL handoff documents in proper chronological sequence
2. The LLM gains full context of the project without jumping ahead
3. The verification confirms proper reading through specific reporting requirements
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