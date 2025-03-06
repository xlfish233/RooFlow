
====

# Milestone Document Creation

## Milestone Directory Structure

Each milestone directory contains these files:

### 1. 0-milestone-summary.md

```markdown
# [Project/Feature] Milestone Summary - [DATE]

## Changes Implemented
- [Major change 1]
- [Major change 2]

## Key Decisions
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

## Discoveries
- [Important finding 1]
- [Important finding 2]

## Current System State
- [Component 1]: [Status]
- [Component 2]: [Status]
```

### 2. 0-lessons-learned.md

```markdown
# Lessons Learned - [Feature/Component]

## [Problem Category 1]

**Problem:** [Issue description]

**Solution:**
- [Step 1]
- [Step 2]
- [Step 3]

## [Problem Category 2]

**Problem:** [Issue description]

**Solution:**
- [Implementation details]
- [Code patterns to use]
```

## Creation Process

The milestone creation process requires:

### 1. Directory Creation

Create milestone directory with format: `N-milestone-name`
- Use sequential numbering based on existing milestone directories
- Use descriptive name reflecting the milestone's focus

### 2. Handoff Organization

Move all numbered handoff documents from the handoffs/ root into the milestone directory
- Use appropriate file system scripts (see 0-system/instructions/3-milestone-scripts.md)
- Verify successful file movement
- Do NOT move any files from the 0-system directory

| Language | Script Example |
|----------|---------------|
| Bash | `find handoffs/ -maxdepth 1 -type d -name "[0-9]*-*" | sort -V | tail -n1 | sed -E 's/.*\/([0-9]+).*/\1/' | awk '{print $1+1}' | xargs -I {} mkdir -p "handoffs/{}-milestone-name"; find handoffs/ -maxdepth 1 -type f -name "[1-9]*.md" -exec mv {} "handoffs/$milestone-name/" \;` |
| PowerShell | `$milestone = (Get-ChildItem "handoffs" -Directory | Where {$_.Name -match "^\d+-"} | ForEach {[int]($_.Name -split "-")[0]} | Measure -Max).Maximum + 1; New-Item -Path "handoffs/$milestone-milestone-name" -ItemType Directory -Force; Get-ChildItem -Path "handoffs" -Filter "[1-9]*.md" | Move-Item -Destination "handoffs/$milestone-milestone-name/"` |

### 3. Summary Generation

- Distill essential information from all related handoffs
- Focus on patterns across multiple handoffs
- Prioritize technical insights and reusable knowledge
- Structure information for easy reference

## Recommended Milestone Timing

Create milestones when:
- 3-5 handoffs have accumulated
- A major feature or component is completed
- A significant project phase has concluded
- Critical problems have been solved with valuable lessons

> **Critical Step:** Always create a final handoff documenting the most recent work before creating a milestone. This ensures the milestone captures the complete picture.