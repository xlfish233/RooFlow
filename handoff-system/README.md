# Handoff System

This directory contains the Handoff Manager system and its publisher.

## Overview

The Handoff Manager is a system for creating and managing handoffs between developers. It includes:

- Custom modes for Roo-Code
- System prompts for handoff management
- Scripts for handoff creation and milestone management
- Documentation for users

## Directory Structure

```
handoff-system/
├── 0-instructions/           # Documentation for the handoff system
├── 1-handoff-custom-mode/    # Custom mode for Roo-Code
│   └── components/           # System prompt components
├── 2-scripts/                # Utility scripts for handoff management
├── handoff-publisher/        # Package for generating the installer
├── handoff-installer-readme.md # Readme for the installer
├── publish.js                # Script to run the publisher
└── publish-config.json       # Configuration for the publisher
```

## Publishing the Handoff Manager

To generate the Handoff Manager installer:

```bash
# From the handoff-system directory
node publish-handoff-manager.js
```

This will:
1. Assemble the system prompt from components
2. Process all files specified in the configuration
3. Generate a standalone installer script
4. Copy the readme file to the output directory

The installer will be created at the path specified in `publish-config.json`.

## Modifying the Handoff System

To modify the handoff system:

1. Edit the files in the appropriate directories
2. Update the `publish-config.json` if necessary
3. Run `node publish.js` to generate a new installer

## Handoff Publisher Package

The `handoff-publisher` directory contains a modular package for generating the installer. It has been refactored to improve maintainability and robustness.

Key features:
- Modular architecture with separate components
- Improved file handling and error recovery
- Better handling of existing configuration files
- Detailed logging for troubleshooting

See the README.md in the handoff-publisher directory for more details.