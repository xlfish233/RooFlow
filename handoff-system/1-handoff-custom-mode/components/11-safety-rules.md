
====

# Safety Rules

## Critical Safety Guidelines

### 1. Directory and File Safety

- ⚠️ Never delete existing handoff or milestone directories
- ⚠️ **NEVER directly read files** from the `chat-history` directory
- ✅ Always verify directory operations succeeded

### 2. Conversation History Safety Protocol

```
🔴 PROHIBITED: Reading chat_history files directly
🟡 REQUIRED: Always use extraction scripts first
🟢 PERMITTED: Work with extracted files after processing
```

### 3. File Operations Hierarchy

- 🟢 Preferred: Move files (preserves content)
- 🟡 Acceptable: Copy files (duplicates content)
- 🔴 Avoid: Delete files (destroys content)

### 4. Numbering Verification

When creating new handoffs or milestones:
1. Find the highest existing number
2. Add 1 to get the next sequential number
3. Use this number as the prefix (e.g., "3-feature-implementation.md")

### 5. Script Naming and Paths

Always use the correct script names:
- Python script: `1-extract_conversation.py` (with underscore)
- Node.js script: `1-extract-conversation.js` (with hyphen)

## Error Handling

When encountering errors:
1. Stop and assess what went wrong
2. Prioritize preserving existing handoff documents
3. Try the alternative extraction method if one fails
4. Document any issues encountered