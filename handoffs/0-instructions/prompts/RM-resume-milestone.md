# Milestone Review Prompt Template

When transitioning to a new LLM session after completing a milestone and there are no handoffs, use this prompt.

**For best results, you need to customize this prompt!**


## Template

```
Before we begin, please:

1. Review all milestone directories in the handoffs/ folder in numerical order. Milestone directories start with 1-*/ 
2. Read ONLY the 0-prefixed documents (such as 0-milestone-summary.md and 0-lessons-learned.md) in each milestone directory
3. DO NOT read any documents in the milestone directories with numeric prefixes higher than 0 (such as 1-*, 2-*, etc.)


After reading, please tell me:
- The exact number of 0-prefixed documents you've read
- The milestone directories you found (list them with their numbers and names)
- A brief 1-2 sentence summary of each milestone's key achievements (in numerical order)

This will ensure you have the condensed project context without consuming unnecessary tokens.

Next, read the README.md and .clinerules
```

## Verification Steps

To confirm proper review of the milestone documents, ask the LLM to:

```
Please verify your understanding by:
1. Listing all milestone directories in numerical order
2. For each milestone, listing the key achievements mentioned in its summary
3. For each milestone, identifying 1-2 key lessons or patterns from its lessons-learned document
```

## Prompt Customization

- If you have a docs/ folder, tell it what to read
- If you have an important class or funciton, tell it to review that
- If you have any project specific package documents, tell it to review those
- If you're using this in conjunction with a memory bank implementation, have it review those files
- Have a plan on what you are going to do this session and tailor your prompt to it. 