# The Handoff System - Advanced Guide

## Overview

This guide covers the advanced implementation of the Handoff System with custom Roo-Code modes for enhanced functionality. For a basic implementation that works with any LLM, see [The Handoff System - Basic Guide](handoff-system-basic.md).

The advanced implementation adds:
- Custom modes for specialized handoff and milestone management
- Rule files to guide LLM behavior
- Automation scripts for organizing documentation
- Enhanced verification and consistency

## Custom Modes Setup

### 1. Complete Basic Setup First

Follow the steps in the [Basic Guide](handoff-system-basic.md) to set up the directory structure and core files.

### 2. Add the Rules Files

Copy these files to your project's `handoffs/` directory:

- **`.clinerules`**: Main rules file with this content:
  ```
  # Handoff System Rules

  Assess context relevance after each substantive exchange. Create handoff documents in the handoffs/ directory when context becomes diluted with irrelevant information, after completing discrete project segments, or during prolonged debugging sessions. Create milestone documents in handoffs/ subdirectories when completing major features or after 3-5 related handoffs accumulate. A fresh LLM session with focused context often solves problems that an overloaded session cannot.
  ```
- **`.clinerules-handoff-manager`**: Specialized rules for handoff creation
- **`.clinerules-milestone-manager`**: Specialized rules for milestone creation

### 3. Set Up Custom Modes

Copy the `.roomodes` file to your project's `handoffs/` directory from the RooCode-Tips-Tricks repository. This file defines two special-purpose modes:

- **`handoff-manager`**: Specialized mode for creating properly formatted handoff documents
- **`milestone-manager`**: Specialized mode for creating milestone summaries and organizing handoffs

### 4. Add Advanced Instruction Files

Copy these additional files to your `handoffs/0-instructions/` directory:
- `3-milestone-scripts.md`: Scripts for managing milestone organization
- `create-handoff-prompt.md`: Templates for handoff creation
- `create-milestone-prompt.md`: Templates for milestone creation

## Using Custom Modes

### Creating Handoffs with handoff-manager Mode

1. Switch to the `handoff-manager` mode
2. Use this prompt:

```
I need to create a handoff document for our current work. Please:

1. Read the handoffs/0-instructions/1-handoff-instructions.md
2. Determine the next sequential handoff number by examining ONLY the handoffs/ root directory
3. Create a properly structured handoff file with that number
```

Benefits of using handoff-manager mode:
- Enforces correct handoff numbering
- Ensures proper formatting of all sections
- Intelligently fills content based on conversation history
- Maintains consistent naming conventions

### Creating Milestones with milestone-manager Mode

1. Switch to the `milestone-manager` mode
2. Use this prompt:

```
I need to create a milestone for our completed [FEATURE/COMPONENT]. Please:

1. Read the handoffs/0-instructions/2-milestone-instructions.md
2. Determine the next sequential milestone number by examining existing milestone directories
3. Create the milestone directory with that number
4. Move all numbered handoff documents from the handoffs/ root into this milestone directory
5. Create the required 0-milestone-summary.md and 0-lessons-learned.md files
```

Benefits of using milestone-manager mode:
- Correctly manages file reorganization
- Creates properly structured milestone summaries
- Distills key information from multiple handoffs
- Maintains consistent formatting

## Milestone Reorganization Scripts

For automatically organizing handoffs into milestone directories, use these scripts depending on your environment:

### Node.js Script
```javascript
const fs = require('fs'), path = require('path'); 
const dirs = fs.readdirSync('handoffs').filter(d => fs.statSync(path.join('handoffs', d)).isDirectory() && /^\\d+-/.test(d)); 
const next_num = dirs.length === 0 ? 1 : Math.max(...dirs.map(d => parseInt(d.match(/^(\\d+)-/)[1]) || 0)) + 1; 
fs.mkdirSync(path.join('handoffs', `${next_num}-milestone-name`), { recursive: true }); 
fs.readdirSync('handoffs').filter(f => /^[1-9].*\\.md$/.test(f) && fs.statSync(path.join('handoffs', f)).isFile()).forEach(f => fs.renameSync(path.join('handoffs', f), path.join('handoffs', `${next_num}-milestone-name`, f)));
```

### Python Script
```python
import os, re, shutil
next_num = 1 if not [d for d in os.listdir("handoffs") if os.path.isdir(os.path.join("handoffs", d)) and re.match(r"\d+-", d)] else max([int(re.match(r"(\d+)-", d).group(1)) for d in os.listdir("handoffs") if os.path.isdir(os.path.join("handoffs", d)) and re.match(r"\d+-", d)]) + 1
os.makedirs(f"handoffs/{next_num}-milestone-name", exist_ok=True)
[shutil.move(os.path.join("handoffs", f), os.path.join(f"handoffs/{next_num}-milestone-name", f)) for f in os.listdir("handoffs") if re.match(r"[1-9]", f) and f.endswith(".md") and os.path.isfile(os.path.join("handoffs", f))]
```

### Bash Script
```bash
next_num=$(find handoffs/ -maxdepth 1 -type d -name "[0-9]*-*" 2>/dev/null | wc -l | xargs test "0" -eq && echo "1" || find handoffs/ -maxdepth 1 -type d -name "[0-9]*-*" | sort -V | tail -n1 | sed -E 's/.*\/([0-9]+).*/\1/' | awk '{print $1+1}')
mkdir -p "handoffs/${next_num}-milestone-name"
find handoffs/ -maxdepth 1 -type f -name "[1-9]*.md" -exec mv {} "handoffs/${next_num}-milestone-name/" \;
```

### PowerShell Script
```powershell
$next_num = if (!(Get-ChildItem "handoffs" -Directory | Where {$_.Name -match "^\d+-"})) {1} else {(Get-ChildItem "handoffs" -Directory | Where {$_.Name -match "^\d+-"} | ForEach {[int]($_.Name -split "-")[0]} | Measure -Max).Maximum + 1}
New-Item -Path "handoffs/${next_num}-milestone-name" -ItemType Directory -Force
Get-ChildItem -Path "handoffs" -Filter "[1-9]*.md" | Move-Item -Destination "handoffs/${next_num}-milestone-name/"
```

## Advanced Tips & Best Practices

1. **Consistent Switching**: Always use the correct mode when creating handoffs or milestones
2. **Milestone Naming**: Use descriptive names that reflect the phase completed (e.g., "2-authentication-feature")
3. **Custom Rules**: Modify `.clinerules` files to adapt to project-specific requirements
4. **Regular Verification**: Use the verification steps in the prompt templates to ensure proper context loading
5. **Script Automation**: Incorporate milestone scripts into your workflow for consistent organization

## Integration with Roo-Code

For users interested in deeper integration with Roo-Code, consider these options:

- **Lightweight Integration**: For a minimally invasive approach with UI components, see the [lightweight integration proposal](../cheatsheets/roo-code-lightweight-integration.md)
- **Comprehensive Integration**: For a theoretical architecture of full native integration, see the [integration architecture](../cheatsheets/roo-code-handoff-integration-theory.md)

## Future Enhancements

For exceptionally complex projects, consider implementing:

1. **Epochs**: A third tier for consolidating multiple milestones into major project phases
2. **Graph Database Integration**: Enhanced knowledge retrieval using tools like Kùzu

## Related Resources

- [Custom Modes Documentation](../cheatsheets/custom-modes-llm-instruction.md) - Details on custom mode capabilities
- [Large File Handling](../cheatsheets/llm-large-file-cheatsheet.md) - Complementary techniques for large files