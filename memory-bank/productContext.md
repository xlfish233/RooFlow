# RooFlow Project Context

## Project Overview

RooFlow is a VS Code extension project that enhances the Roo Code AI assistant with improved persistent memory and streamlined mode interactions. It builds upon the original "Roo Code Memory Bank" concept with a more efficient and integrated system.

## Core Functionality

* **Persistent Memory:** Implementation of a "Memory Bank" using Markdown files for maintaining context across sessions
* **Mode-Specific Behavior:** Uses `.clinerules-[mode].txt` files to define behavior for each mode
* **System Prompts:** Uses `system-prompt-[mode].txt` files in `.roo/` directory for core instructions
* **Real-time Updates:** Memory Bank updates based on significant events
* **UMB Command:** Manual Memory Bank synchronization
* **Reduced Token Use:** Optimized instructions

## Meta Nature

This is a meta project that modifies files controlling Roo's behavior. Key aspects:

1. **Working Files:** All modifiable files use `.txt` extension
2. **Roo Code Files:** Original extension files remain unchanged during development
3. **Deployment:** Manual copy/overwrite process (outside initial scope)

## File Structure

### Memory Bank Files
* `activeContext.md`: Tracks current session context and immediate goals
* `productContext.md`: This file - Contains project overview and core documentation
* `progress.md`: Tracks tasks and project progress
* `decisionLog.md`: Documents key decisions and their rationale

### Working Files (`.txt` extension only)
* Mode-specific rules: `clinerules-[mode].txt`
* System prompts: `roo-test/system-prompt-[mode].txt`
* Other: `roomodes.txt`, `README.md`

## Project Goals

1. Complete UMB integration across all modes
2. Optimize and refine mode instructions
3. Thorough system testing
4. Create comprehensive README
5. Prepare deployment process

## Development Guidelines

* Only modify `.txt` extension files
* Test changes frequently
* Use UMB command regularly
* Continuously refine instructions
* Follow established development workflow