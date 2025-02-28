# Handoff Review Prompt Template

When transitioning to a new LLM session during ongoing work, use this prompt to efficiently transfer all project progress through the handoff documents. 

**For best results, you need to customize this prompt!**


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

Finally, read the README.md and .clinerules
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

## Prompt Customization

- If you have a docs/ folder, tell it what to read
- If you have an important class or funciton, tell it to review that
- If you have any project specific package documents, tell it to review those
- If you're using this in conjunction with a memory bank implementation, have it review those files
- Have a plan on what you are going to do this session and tailor your prompt to it. 
