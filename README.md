# RooFlow: Streamlined AI-Assisted Development with Persistent Context

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue.svg?logo=visualstudiocode)]([VSCODE_EXTENSION_LINK]) <!-- Replace with actual link -->
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)]([LICENSE_LINK]) <!-- Replace with actual link -->
[![GitHub Issues](https://img.shields.io/badge/Issues-GitHub-red.svg)]([ISSUES_LINK]) <!-- Replace with actual link -->
[![GitHub Stars](https://img.shields.io/github/stars/[YOUR_GITHUB_USERNAME]/[YOUR_REPO_NAME]?style=social)]([REPO_LINK]) <!-- Replace with your repo details -->

<div align="center">
<img src="[LOGO_URL]" alt="RooFlow Logo" width="200">  <!-- Replace with your logo URL -->
</div>

## Introduction

RooFlow is a powerful extension for VS Code that transforms the way you interact with AI coding assistants. It combines a **structured handoff system** for persistent project context with **streamlined, mode-specific prompts** for optimal LLM performance and token efficiency.  RooFlow addresses the common challenges of context degradation, knowledge loss, and inefficient LLM interactions, enabling a more focused, productive, and collaborative development workflow.

## The Problem: Traditional LLM Limitations

Working with LLMs in extended development sessions often leads to:

*   **Context Window Saturation:**  Irrelevant information accumulates, hindering the LLM's ability to focus on the current task.
*   **Performance Degradation:**  Long sessions can lead to reduced reasoning quality and increased hallucinations.
*   **Token Consumption:**  Large, unfocused contexts consume more tokens, increasing costs.
*   **Knowledge Loss:**  Starting fresh sessions means losing valuable project understanding and having to re-explain context.

## The RooFlow Solution: Handoffs, Milestones, and Optimized Modes

RooFlow tackles these challenges with a three-pronged approach:

1.  **The Handoff System:**  A structured approach to capturing project knowledge and progress *chronologically*.  It uses two key document types:
    *   **Handoff Documents:**  Fine-grained records of individual work sessions, capturing what was done, learned, and planned.  These are *append-only*, preserving a complete history.
    *   **Milestone Documents:**  Periodic consolidations of multiple handoffs, providing higher-level summaries of completed features or project phases.

2.  **Custom Modes:**  Specialized modes for each stage of the development workflow, each with a *focused and optimized system prompt*.  This minimizes token usage and maximizes LLM performance for each specific task.

3. **Streamlined Prompts:** All prompts are written in YAML, a concise format that is both human and machine-readable, leading to better token economy.

## Key Features

*   **Seamless Context Switching:** Effortlessly resume work from where you left off, even after interruptions or across multiple sessions.
*   **Chronological Project History:** Automatically generated, detailed documentation of your entire development process, including decisions, problems, and solutions.
*   **Targeted Context Loading:**  Load only the *relevant* handoff and milestone documents, minimizing token consumption and maximizing LLM focus.
*   **Reduced Hallucinations:** Fresh LLM sessions with clean, targeted context improve reasoning quality and reduce errors.
*   **Optimized Token Usage:**  Streamlined prompts and selective context loading minimize token consumption, saving costs.
*   **Improved Collaboration:**  Clear documentation and a structured workflow make it easier for teams to work together.
*   **Easy Migration:** Includes a built-in mechanism to convert existing Roo Code Memory Banks to the Handoff System.
*   **Flexible and Extensible:** Designed to adapt to various project sizes and workflows.
*   **Intelligent Directory Detection:** Automatically finds your `handoffs` directory.

## RooFlow Modes

RooFlow provides a set of built-in and custom modes to support the entire development lifecycle:

| Mode                | Description                                                                                                  |
| :------------------ | :----------------------------------------------------------------------------------------------------------- |
| **Architect**       | High-level system design, project planning, and documentation structure. Creates initial project handoffs. |
| **Code**            | Code implementation, modification, and concurrent documentation updates.                                  |
| **Test**            | *Dedicated mode for test-driven development.* Creates tests *before* code implementation.                   |
| **Debug**           | Troubleshooting, bug fixing, and root cause analysis.  Operates in a read-only manner to ensure integrity. |
| **Ask**             | General knowledge assistant for project-specific and general programming questions.                          |
| **Handoff Manager** | *Custom mode* for creating and numbering handoff documents.                                                  |
| **Milestone Manager** | *Custom mode* for creating milestone summaries and organizing handoff documents.                           |
| **Session Restorer** | *Custom mode* for loading the appropriate context from handoffs and milestones to resume work.            |

## Getting Started

1.  **Install Roo Code:** Make sure you have the latest version of the Roo Code extension for VS Code installed. ([VSCODE_EXTENSION_LINK] - Replace with link)

2.  **Create a Project:** Start a new project or open an existing one in VS Code.

3.  **Initialize the Handoff System:**
    *   Open the Roo Code chat panel.
    *   Switch to the **Architect** mode.
    *   Send a message like "Initialize the Handoff System."
    *   Roo will guide you through the process of creating the `handoffs/` directory and the initial instruction files.

4.  **(Optional) Create a `projectBrief.md`:** In your project's root directory, create a file named `projectBrief.md` to provide initial project context to Roo.

5.  **Start Coding!** Use the different modes (Architect, Code, Test, Debug, Ask) to work on your project.

6.  **Create Handoffs:** At the end of each work session (or more frequently!), switch to the **Handoff Manager** mode and create a handoff document. Roo will guide you through the process.

7.  **Create Milestones:** When you complete a significant feature or project phase, use the **Milestone Manager** mode to create a milestone summary.

8.  **Resume Sessions:** When you return to your project, use the **Session Restorer** mode to load the relevant context.

## File Structure

The Handoff System uses the following directory structure within your project:
Use code with caution.
```markdown
project/
├── handoffs/ # Main handoff directory (created by RooFlow)
│ ├── 0-instructions/ # System documentation
│ │ ├── 1-handoff-instructions.md # Instructions for creating handoffs
│ │ ├── 2-milestone-instructions.md # Instructions for creating milestones
│ │ └── 3-milestone-scripts.md # (Optional) Scripts for milestone management
│ │
│ ├── 1-feature-milestone/ # Milestone directory (numbered sequentially)
│ │ ├── 0-milestone-summary.md # Consolidated milestone information
│ │ ├── 0-lessons-learned.md # Key learnings
│ │ └── ... # Copies of related handoff documents
│ │
│ ├── 2-refactor-milestone/ # Next sequential milestone
│ │ ├── 0-milestone-summary.md
│ │ └── 0-lessons-learned.md
│ │
│ ├── 1-setup.md # Sequential handoff documents
│ ├── 2-implementation.md # Files are sorted after folders
│ ├── 3-bugfixes.md
│ ├── 4-feature-x.md
│ └── 5-refactoring.md
├── .clinerules # Global rules (optional, for advanced configuration)
├── .clinerules-architect # Mode-specific rules (no extensions)
├── .clinerules-code
├── .clinerules-test
├── .clinerules-debug
├── .clinerules-ask
├── .clinerules-handoff-manager
├── .clinerules-milestone-manager
├── .clinerules-session-restorer
└── .roomodes # Custom mode definitions (JSON format)
.roo/ #This directory is created and maintained by the extension.
├── system-prompt-architect # Mode-specific rules (no extensions)
├── system-prompt-code
├── system-prompt-test
├── system-prompt-debug
├── system-prompt-ask
├── system-prompt-handoff-manager
├── system-prompt-milestone-manager
└── system-prompt-session-restorer
```
**Note:** The `system-prompt-[mode]` files are part of the Roo Code extension itself and are not directly modified by the user.  They are included in the list above for completeness, to show all the files involved in the system.

## Advanced Configuration (Optional)

For advanced users, you can further customize RooFlow:

*   **`.clinerules`:** Add global rules that apply to all modes.
*   **`.clinerules-[mode]`:** Add mode-specific rules to fine-tune the behavior of individual modes.  These files contain YAML.
*   **`.roomodes`:** Modify the custom mode definitions (e.g., change file restrictions for the Test, Handoff Manager, Milestone Manager, and Session Restorer modes).  *Be very careful when modifying this file.* This is a JSON file.
* **`handoffs/0-instructions/`:** Modify the instructions within these files to customize the handoff and milestone creation process.

**Important:**  The `roomodes.txt` file, along with all the `system-prompt-*` and `.clinerules-*` files, are provided in this repository. You should *not* need to modify them unless you are making advanced customizations. The system prompt files and clinerules files *do not* have file extensions.

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md]([CONTRIBUTING_LINK]) file for details. <!-- Replace with actual link -->

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE]([LICENSE_LINK]) file for details. <!-- Replace with actual link -->

---

<div align="center">

**[View on GitHub]([REPO_LINK]) • [Report Issues]([ISSUES_LINK]) • [Get Roo Code]([VSCODE_EXTENSION_LINK])**

</div>
