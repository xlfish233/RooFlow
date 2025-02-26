# Milestone Review Prompt Template

When transitioning to a new LLM session after completing milestone(s), use this prompt to efficiently transfer knowledge without consuming unnecessary context tokens.

## Template

```
Before we begin, please:

1. Review all milestone directories in the handoffs/ folder
2. Read ONLY the 0-prefixed documents (such as 0-milestone-summary.md and 0-lessons-learned.md) in each milestone directory
3. DO NOT read any documents with numeric prefixes higher than 0 (such as 1-*, 2-*, etc.)
4. Read these milestone summaries in sequential order from earliest to most recent

After reading, please tell me:
- The exact number of 0-prefixed documents you've read
- The milestone directories you found
- A brief 1-2 sentence summary of each milestone's key achievements

This will ensure you have the condensed project context without consuming unnecessary tokens.
```

## Purpose

This prompt ensures that:

1. The LLM reads only the condensed milestone summaries, not the verbose handoff documents
2. All milestone directories are processed in the correct sequence
3. The verification steps (counting documents and summarizing) confirm proper reading
4. Context window space is used efficiently by focusing only on essential information

## Usage

Paste this prompt at the beginning of a new LLM session after reaching a milestone in your project. This gives the new LLM instance the necessary background without overwhelming its context window.

Wait for the LLM to provide the document count and summaries before proceeding with new work to ensure proper knowledge transfer.