# Roo Code Tips & Tricks

A collection of files designed to supercharge your Roo Code experience and maximize productivity.

## Introduction

These productivity-enhancing templates can be added to your projects to modify how Roo Code's LLM behaves, creating a more efficient and effective development workflow.

## Compatibility Note

**Optimized for Claude 3.7 Sonnet with thinking enabled**

These techniques work best with Claude 3.7 Sonnet when the thinking feature is enabled. I recommend a minimum of 2k reasoning, but the system performs optimally with 8k thinking capacity, allowing for more comprehensive context assessment and handoff preparation.

## Available Resources

### [Handoffs System](handoffs/)
**Solve the context window overload problem once and for all.**

The Handoffs System provides a streamlined approach to manage LLM context across extended development sessions. Instead of watching your LLM gradually become confused or hitting token limits, this system enables smooth transitions between fresh LLM sessions without losing critical project knowledge.

**Key Benefits:**
- Maintain peak LLM performance throughout long projects
- Reduce token usage and associated costs
- Preserve focus on what matters most
- Break through stubborn debugging challenges with "fresh eyes"
- Document project progress automatically

The system includes ready-to-use templates, sample handoff documents, and comprehensive instructions for implementation.

### [Large File Handling Cheatsheet](llm-large-file-cheatsheet.md)
A comprehensive toolkit for working with large files that would normally exceed LLM context windows. Includes powerful one-liners and code snippets in Python, Bash, Node.js, and PowerShell to extract exactly what you need without overwhelming your LLM.

### [Custom Modes LLM Instructions](custom-modes-llm-instruction.md)
Unlock the full potential of Roo Code's custom modes system with this detailed guide covering data structures, tool groups, file restrictions, and best practices with practical examples.

## Getting Started

Each resource includes detailed implementation instructions within its files. Simply clone this repository, copy the desired files into your project, and follow the specific setup instructions within each resource.

For the Handoffs System, start by exploring the [instructions](handoffs/0-instructions/) directory to understand the system architecture.

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy Coding with Roo!** 🐨