# RooFlow Project Brief

## Project Overview

RooFlow is a VS Code extension project designed to enhance the Roo Code AI assistant with improved persistent memory and streamlined mode interactions.  It builds upon the concepts of the original "Roo Code Memory Bank" but introduces a more efficient and integrated system.  **Crucially, RooFlow modifies the behavior of the Roo Code extension itself.**

## Core Functionality

*   **Persistent Memory:** RooFlow implements a "Memory Bank" – a set of Markdown files (`.md`) that store project-specific information, allowing Roo to maintain context across sessions.
*   **Mode-Specific Behavior:** RooFlow uses YAML-formatted `.clinerules-[mode].txt` files to define the behavior and capabilities of each Roo mode (Architect, Code, Test, Debug, Ask).
*   **System Prompts:** RooFlow uses YAML-formatted `system-prompt-[mode].txt` files, located in a `.roo/` directory, to provide core instructions to each mode. These files define the available tools and general instructions.
*   **Real-time Updates:** The Memory Bank is updated in real-time based on significant events within each mode.
*   **UMB Command:** A user command ("Update Memory Bank" or "UMB") allows for manual synchronization of the Memory Bank.
* **Reduced Token Use:** Optimized instructions to reduce token usage.

## Meta Nature and File Duplication

**THIS IS A META PROJECT:** RooFlow is designed to modify the files that *control* Roo's behavior.  To prevent conflicts and ensure stability, we are using a file duplication strategy:

*   **Working Files:**  All files that RooFlow will *modify* have a `.txt` extension.  This includes:
    *   `clinerules-architect.txt`
    *   `clinerules-code.txt`
    *   `clinerules-debug.txt`
    *   `clinerules-ask.txt`
    *   `clinerules-test.txt`
    *   `roo-test/system-prompt-architect.txt`
    *   `roo-test/system-prompt-code.txt`
    *   `roo-test/system-prompt-debug.txt`
    *   `roo-test/system-prompt-ask.txt`
    *   `roo-test/system-prompt-test.txt`
    *   `roomodes.txt`
    *   `README.md` (This file)

*   **Roo Code's Files:**  The *actual* files used by the Roo Code extension *remain unchanged* during development. Roo Code will continue to use its default files (e.g., `.clinerules-architect`, `.roo/system-prompt-architect`, etc.).

* **Deployment:** The deployment process (which is *outside* the scope of this initial setup) will involve copying the contents of the `.txt` files to their corresponding Roo Code files (overwriting the originals).  This copy/overwrite process will be handled *separately* and *manually* for now.

**YOU (Roo) MUST ONLY MODIFY FILES WITH THE `.txt` EXTENSION.**  Do *not* attempt to modify files *without* the `.txt` extension.  This is critical to prevent conflicts and ensure the stability of the Roo Code extension during development.

## Initial Memory Bank Setup

When initializing the Memory Bank (because the `memory-bank/` directory does *not* exist), you should:

1.  Create the `memory-bank/` directory.
2.  Create the following core files within `memory-bank/`:
    *   `activeContext.md`:  Initially empty, or with a basic heading like `# Active Context`.
    *   `productContext.md`:  Populate this file with a summary of the information from this `projectBrief.md`.  Include the project overview, core functionality, meta nature, and file duplication strategy.
    *   `progress.md`:  Initially, create a basic structure for tracking tasks (e.g., "## Work Done", "## Next Steps").
    *   `decisionLog.md`:  Initially empty, or with a basic heading like `# Decision Log`.

## Project Goals (Initial)

The initial goals for this project are:

1.  **Complete Integration:**  Ensure that the UMB functionality is correctly integrated into all five Roo modes (Architect, Code, Test, Debug, Ask).
2.  **Refine Instructions:**  Optimize the `.clinerules-[mode].txt` and `system-prompt-[mode].txt` files for clarity, conciseness, and correct behavior.
3.  **Thorough Testing:**  Test the integrated system extensively to ensure that all modes function as expected, the Memory Bank is updated correctly, and the UMB command works reliably.
4.  **Create README:** Create a comprehensive `README.md` file for the RooFlow project.
5. **Prepare for Deployment:** Create a simple process/script for copying the contents of the `.txt` files to their corresponding Roo Code files.

## Development Workflow

1.  **Use RooFlow:** Use the Roo Code extension with the RooFlow files (as described above) to develop and refine RooFlow itself.
2.  **Test Frequently:**  Test each change thoroughly to ensure that the Memory Bank is updated correctly and that the modes behave as expected.
3.  **Use UMB:** Use the "Update Memory Bank" command regularly to save the session context.
4.  **Refine Instructions:**  Continuously refine the instructions in the `.clinerules-[mode].txt` and `system-prompt-[mode].txt` files to improve clarity and efficiency.

This `projectBrief.md` provides the essential information for Roo to initialize the Memory Bank and begin working on the RooFlow project. It emphasizes the meta nature of the project, the file duplication strategy, and the initial goals. It also provides a clear development workflow.