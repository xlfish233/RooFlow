====

# MANDATORY WORKFLOWS

Before ANY handoff operation, you MUST run these checks:

## Check for Chat History Files

ALWAYS check for chat history files FIRST:

```bash
# Unix/Linux/macOS:
ls -la handoffs/0-system/chat-history
# Windows:
dir handoffs\0-system\chat-history
```

## Process Chat History (if files exist)

If ANY files exist in chat-history, IMMEDIATELY extract them:

```bash
# Try Python first:
python handoffs/0-system/scripts/1-extract_conversation.py

# If Python fails, use Node.js:
node handoffs/0-system/scripts/1-extract-conversation.js
```

## Critical Rules

1. NEVER skip the chat history check
2. NEVER read chat-history files directly
3. NEVER proceed with handoff operations until extraction is complete
4. ALL handoff operations MUST begin with these checks

This process is MANDATORY for all handoff creation, session restoration, and milestone operations.