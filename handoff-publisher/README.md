# Handoff Publisher

A modular package for generating the Handoff Manager installer.

## Overview

The Handoff Publisher is a Node.js package that generates a standalone installer for the Handoff Manager system. It follows a configuration-driven approach where:

1. The `publish-config.json` specifies which files to include
2. The `system-prompt-config.json` defines how to assemble the system prompt

This modular approach allows evolution of the handoff system without modifying the publisher code.

## Directory Structure

```
handoff-publisher/
├── config/
│   └── publish-config.json     # Configuration for the publisher
├── lib/
│   ├── file-utils.js           # File operation utilities
│   ├── config-merger.js        # Handles merging of configuration files
│   ├── system-prompt.js        # Assembles the system prompt
│   └── installer-generator.js  # Generates the installer script
├── index.js                    # Main entry point
├── package.json                # Package metadata
└── README.md                   # This file
```

## Usage

From the handoff-system directory:

```bash
cd handoff-publisher
npm install
node index.js [output-file-path]
```

If no output file path is provided, it will use the path specified in `config/publish-config.json`.

## Configuration

The `publish-config.json` file contains the following settings:

- `name`: Name of the handoff manager
- `version`: Version number
- `description`: Description of the handoff manager
- `outputFile`: Path to the output installer file
- `sourceDir`: Source directory for files
- `rootFiles`: Array of root files to include
- `directories`: Array of directory configurations
- `components`: Configuration for system prompt components
- `maxFileSize`: Maximum file size to include
- `installOptions`: Installation options
- `nextSteps`: Array of next steps to display after installation
- `documentation`: Array of documentation files

## Key Features

1. **Modular Architecture**: Split into logical components for better maintainability
2. **Configuration-Driven**: Uses JSON configuration files for flexibility
3. **Improved File Handling**: Better handling of existing files during installation
4. **Robust Error Handling**: Comprehensive error handling and recovery mechanisms
5. **Detailed Logging**: Verbose logging for easier troubleshooting

## Installer Features

The generated installer includes these key features:

- **Existing Installation Detection**: Automatically detects and backs up any existing handoff system files
- **Configuration Merging**: Preserves existing custom modes when adding handoff-manager mode
- **Complete System**: Contains all necessary files to get started immediately
- **Self-contained**: No external dependencies required

## Maintenance

To update the handoff system:

1. Modify the files in the handoff-system directory
2. Update the `publish-config.json` if necessary
3. Run the publisher to generate a new installer

This approach allows for easy updates without modifying the publisher code.