# Milestone Review Prompt Template

When transitioning to a new LLM session after completing milestone(s), use this prompt to efficiently transfer knowledge without consuming unnecessary context tokens.

## Template

```
Before we begin, please:

1. Review all milestone directories in the handoffs/ folder in numerical order
2. Read ONLY the 0-prefixed documents (such as 0-milestone-summary.md and 0-lessons-learned.md) in each milestone directory
3. DO NOT read any documents with numeric prefixes higher than 0 (such as 1-*, 2-*, etc.)
4. Read these milestone summaries in sequential order from earliest to most recent (1-*, then 2-*, etc.)

After reading, please tell me:
- The exact number of 0-prefixed documents you've read
- The milestone directories you found (list them with their numbers and names)
- A brief 1-2 sentence summary of each milestone's key achievements (in numerical order)

This will ensure you have the condensed project context without consuming unnecessary tokens.

Next, read the README.md and [insert custom instructions here]
```

## Verification Steps

To confirm proper review of the milestone documents, ask the LLM to:

```
Please verify your understanding by:
1. Listing all milestone directories in numerical order
2. For each milestone, listing the key achievements mentioned in its summary
3. For each milestone, identifying 1-2 key lessons or patterns from its lessons-learned document
```

## Introspection Reminder

When continuing the project after reviewing milestones, remember these guidelines for when to create new handoffs:

- After 10+ conversation exchanges
- When context becomes ~30% irrelevant to current task
- After completing a significant project segment
- During debugging sessions exceeding 5 exchanges without resolution

For best results, switch to the "handoff-manager" custom mode when creating handoff documents, and "milestone-manager" custom mode when creating milestone summaries.

## Purpose

This prompt ensures that:

1. The LLM reads only the condensed milestone summaries, not the verbose handoff documents
2. All milestone directories are processed in the correct numerical sequence
3. The verification steps (counting documents and summarizing) confirm proper reading
4. Context window space is used efficiently by focusing only on essential information

## Usage

Paste this prompt at the beginning of a new LLM session after reaching a milestone in your project. This gives the new LLM instance the necessary background without overwhelming its context window.

Wait for the LLM to provide the document count and summaries before proceeding with new work to ensure proper knowledge transfer.

## When to Use

Use this milestone prompt when:
- You've created one or more milestones and want to focus only on the high-level context
- You need to optimize token usage for a complex project
- You want to focus on the essential learnings without all the detailed handoff history
- You're starting a new project phase and need the foundation from prior milestones