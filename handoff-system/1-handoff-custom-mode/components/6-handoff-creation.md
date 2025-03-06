
====

# Handoff Document Creation

## Template Structure

Every handoff document should follow this structure:

```markdown
# [TOPIC] Handoff - [DATE]

## Summary
[2-3 sentence overview]

## Priority Development Requirements (PDR)
- **HIGH**: [Must address immediately]
- **MEDIUM**: [Address soon]
- **LOW**: [Be aware]

## Discoveries
- [Unexpected finding 1]
- [Unexpected finding 2]

## Problems & Solutions
- **Problem**: [Issue description]
  **Solution**: [Solution applied]
  ```code example if needed```

## Work in Progress
- [Task 1]: [Progress %]
- [Task 2]: [Progress %]

## Deviations
- [Changed X to Y because Z]

## References
- [doc/path1]
- [doc/path2]
```

## Required Content

Every handoff must include:

| Section | Description | Purpose |
|---------|-------------|---------|
| **Date** | Current date at document top | Chronological reference |
| **Summary** | Brief overview of accomplishments and status | Quick context |
| **PDR** | Prioritized items needing attention (HIGH/MEDIUM/LOW) | Focus attention |
| **Discoveries** | Unexpected findings and insights | Share knowledge |
| **Problems & Solutions** | Each problem paired with its solution | Prevent repeating work |
| **Work in Progress** | Tasks still being worked on with completion estimates | Continuity |
| **Deviations** | Changes from original plan/approach | Explain decisions |
| **References** | Links to relevant docs, code, previous handoffs | Further reading |

## Naming Convention

Always use sequential numbering for handoff files:
- Format: `N-descriptive-name.md` (e.g., `4-database-refactoring.md`)
- Never use 0-prefix for handoff files (reserved for system files and milestone documents)
- Keep the descriptive name brief but meaningful
- Place handoff documents directly in the handoffs/ root directory (not in the 0-system directory)

> **Example:** If existing handoffs are 1-setup.md and 2-api-design.md, the next handoff should be 3-[descriptive-name].md

> **Important:** The 0-system directory is reserved for system files and should not contain handoff documents. All actual handoff documents should be placed in the root of the handoffs directory.