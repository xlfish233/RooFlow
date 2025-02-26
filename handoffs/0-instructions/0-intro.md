# Handoff and Milestone System

## Purpose and Benefits

This system documents development progress through handoffs (shift reports) that capture work completed during LLM sessions, which later consolidate into milestone documents when key achievements are reached. As LLMs work on projects, they accumulate context that can become bloated with irrelevant information, consuming valuable tokens and potentially leading to confused responses or hallucinations.

By cycling through fresh LLM sessions with concise handoffs, you can:
- Reduce token consumption and associated costs
- Maintain clear context focus on relevant information
- Avoid the degradation of LLM performance that happens over extended sessions
- Prevent context window overflow errors on long-running projects

This approach offers a more streamlined alternative to complex memory bank solutions while keeping token usage efficient from the beginning of each new session.

## Compatibility Note

**Optimized for Claude 3.7 Sonnet with thinking enabled**

This system works best with Claude 3.7 Sonnet when the thinking feature is enabled. We recommend a minimum of 2k reasoning, but the system performs optimally with 8k thinking capacity, allowing for more comprehensive context assessment and handoff preparation.

## Documents

**Handoffs**: Detailed, sequential reports created during development
- Numbered sequentially (1-setup.md, 2-implementation.md)
- Located in handoffs/ root directory
- Capture specific work completed in a session

**Milestones**: Distilled knowledge from multiple handoffs
- Created when a significant achievement is reached
- Stored in numbered folders (1-feature-complete/)
- Contain summary and lessons-learned documents

## When to Create Documents

### Handoffs
Create handoff documents when:
- After completing a significant project segment (feature, bug fix, architectural change)
- When you estimate that >30% of context is no longer relevant to the current task
- After working on the project for an extended session (10+ exchanges)
- During debugging sessions that exceed 5 exchanges without clear resolution

### Milestones
Create milestone documents when:
- A major feature or component is fully implemented and tested
- A significant phase of the project has been completed
- Multiple handoffs (typically 3-5) have accumulated since the last milestone
- A critical problem has been solved that provides valuable lessons
- The project has reached a stable, deployable state

## Context Assessment
Before each major response, LLMs should perform a context assessment by:
1. Reviewing the current context window for:
   - Most relevant content (current task, recent files, active discussions)
   - Moderately relevant content (background information, earlier work)
   - Low-relevance content (initial setup, tangential discussions)
2. Using this assessment to determine if a handoff is needed

During extended debugging sessions, even though it may feel frustrating to start over with a fresh LLM session, recognize that this is often better than continuing down a potentially deteriorating path. The "fresh eyes" of a new session with a clean context but structured handoff information can break through obstacles that an overloaded context window might struggle with.

## Implementation

For proper implementation, ensure the following line exists in your project's `.clinerules` file:

```
Assess context relevance after each substantive exchange. Create handoff documents in the handoffs/ directory when context becomes diluted with irrelevant information, after completing discrete project segments, or during prolonged debugging sessions. Create milestone documents in handoffs/ subdirectories when completing major features or after 3-5 related handoffs accumulate. A fresh LLM session with focused context often solves problems that an overloaded session cannot.
```

This instruction will help guide the LLM in maintaining optimal context and creating appropriate documentation throughout the project lifecycle.

## Quick Process
1. Create handoff documents (1-*.md, 2-*.md, etc.) during development
2. When a milestone is reached, run the appropriate script from 3-milestone-scripts.md
3. The script creates a milestone folder and moves handoff files
4. Create milestone summary files in the new folder

## Detailed Instructions
- [1-handoff-instructions.md](./1-handoff-instructions.md): How to write effective handoffs
- [2-milestone-instructions.md](./2-milestone-instructions.md): Milestone documentation process
- [3-milestone-scripts.md](./3-milestone-scripts.md): Scripts to automate milestone creation