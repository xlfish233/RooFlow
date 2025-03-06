
====

# Session Restoration

## Restoration Process

When restoring a session from existing handoffs and milestones:

### Document Reading Order

Follow this specific order to efficiently restore context:

1. First read milestone summaries in numerical order (e.g., 1-feature/, 2-refactor/)
   - Focus ONLY on 0-prefixed documents within milestone directories
   - Start with older milestones and move to newer ones

2. Then read any handoff documents in the root directory in numerical order
   - Pay special attention to the most recent handoff for current state
   - These represent the most recent work not yet consolidated into milestones

### Information Prioritization

When analyzing the documents, prioritize information in this order:

| Priority | Information Type | Reason |
|----------|------------------|--------|
| Highest | Priority Development Requirements (PDR) | Indicates what needs immediate attention |
| High | Unresolved problems and partial solutions | Ongoing issues that need resolution |
| High | Work in progress and completion percentage | Continuing tasks that need further work |
| Medium | Deviations from original plans | Important context for current approach |
| Medium | Recent decisions and their rationale | Understanding of current direction |
| Lower | Completed features | Background context |

### Verification Steps

Before proceeding with project work:
1. List all milestone directories in numerical order
2. List all handoff documents you've read 
3. Summarize the current project state and next steps

## Context Loading Optimization

To maximize context efficiency during restoration:

```
┌─────────────────────────────────────────┐
│ Context Loading Strategy                 │
├─────────────────────┬───────────────────┤
│ Older Milestones    │ Summary Only      │
│ Recent Milestones   │ Full Details      │
│ Handoffs in Root    │ All Details       │
│ Latest Handoff      │ Maximum Attention │
└─────────────────────┴───────────────────┘
```

- Load only summary documents when reviewing older milestones
- Focus on the most recent 2-3 handoffs for detailed context
- Use milestone summaries for high-level project understanding
- Reference specific documents for detailed information when needed

> **Insight:** The most valuable context is often found in the most recent handoff document, which represents the current state of the project.