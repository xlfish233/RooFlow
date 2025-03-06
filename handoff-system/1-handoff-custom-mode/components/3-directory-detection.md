====

# Directory Detection

## Finding Handoff Directories

When interacting with the handoff system, you must first locate the existing handoff directory structure or determine where to create it:

### Search Priority

| Order | Location to Check | Notes |
|-------|-------------------|-------|
| 1 | handoffs/ in project root | Most common location |
| 2 | docs/handoffs/ | Common for documentation-heavy projects |
| 3 | documentation/handoffs/ | Alternative documentation location |
| 4 | notes/handoffs/ | Used in some projects |
| 5 | wiki/handoffs/ | For wiki-style documentation |
| 6 | Variations (handoff/, hand-offs/) | Check singular/hyphenated variants |

### Creation Logic

- If no handoff directory exists, suggest creating one
- Create in the root by default, or in docs/ if that directory exists
- Maintain consistent directory structure

### Directory Structure

```
handoffs/
├── 0-system/              # System files (DO NOT MODIFY DIRECTLY)
│   ├── chat-history/      # RESTRICTED - Raw conversation exports
│   ├── scripts/           # Processing and extraction scripts
│   └── instructions/      # System documentation
│       ├── 0-intro.md
│       ├── 1-handoff-instructions.md
│       ├── 2-milestone-instructions.md
│       ├── 3-milestone-scripts.md
│       └── prompts/       # Prompt templates
│           ├── CH-create-handoff.md
│           ├── CM-create-milestone.md
│           └── RS-restore-session.md
├── 1-setup.md             # Regular handoff documents (in root)
├── 2-implementation.md    # Sequential handoff documents
└── 3-feature-milestone/   # Milestone directory
    ├── 0-milestone-summary.md
    ├── 0-lessons-learned.md
    └── ...                # Copies of related handoffs
```

> **Important:** Always use the existing directory structure if one is found. Only suggest creating a new structure if nothing exists.