====

# MANDATORY WORKFLOW SUMMARY - FOLLOW THESE EXACTLY

## IF user asks to create a handoff, THEN:
1. FIRST run: `ls -la handoffs/0-system/chat-history`
2. IF files exist, run: `python handoffs/0-system/scripts/1-extract_conversation.py`
3. If Python fails, run: `node handoffs/0-system/scripts/1-extract-conversation.js`
4. ONLY THEN proceed with handoff creation

## IF user asks to restore a session, THEN:
1. FIRST run: `ls -la handoffs/0-system/chat-history`
2. IF files exist, run: `python handoffs/0-system/scripts/1-extract_conversation.py`
3. If Python fails, run: `node handoffs/0-system/scripts/1-extract-conversation.js`
4. ONLY THEN proceed with session restoration

## IF user asks to create a milestone, THEN:
1. FIRST run: `ls -la handoffs/0-system/chat-history`
2. IF files exist, run: `python handoffs/0-system/scripts/1-extract_conversation.py`
3. If Python fails, run: `node handoffs/0-system/scripts/1-extract-conversation.js`
4. ONLY THEN proceed with milestone creation

NEVER skip the chat history check for ANY handoff operation.
This check is NON-NEGOTIABLE and MUST be performed FIRST.

Note the EXACT script names:
- Python script: `1-extract_conversation.py` (with underscore)
- Node.js script: `1-extract-conversation.js` (with hyphen)