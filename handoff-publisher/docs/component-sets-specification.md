# Component Sets Specification

## Overview

The Handoff Publisher system uses a component-based architecture for modular, maintainable code. This specification defines how to create and use component sets within the publisher.

## What is a Component Set?

A component set is a collection of files that work together to provide specific functionality. Each component set:

1. Has a dedicated directory
2. Contains numbered component files (e.g., `1-utils.js`, `2-backup.js`)
3. Includes a configuration file (e.g., `src-config.json`, `system-prompt-config.json`)
4. Is defined in `publish-config.json` under the `componentSets` array

## Creating a New Component Set

To create a new component set:

1. Create a dedicated directory for your components
2. Create numbered component files with clear names
3. Create a configuration file for the component set
4. Add the component set to the `componentSets` array in `publish-config.json`

### Component Naming Convention

Components should follow this naming convention:
- Prefix with a number to indicate loading order
- Use descriptive names for the functionality
- Example: `1-utils.js`, `2-processor.js`, `3-formatter.js`

### Configuration File Structure

Each component set needs a configuration file with this structure:

```json
{
  "components": [
    {
      "file": "1-component.js",
      "description": "Description of the component's functionality"
    },
    {
      "file": "2-component.js",
      "description": "Description of the component's functionality"
    }
  ],
  "version": "1.0.0",
  "errorHandling": {
    "missingFile": "error",
    "continueOnError": false
  }
}
```

### Adding to publish-config.json

Add your component set to the `componentSets` array in `publish-config.json`:

```json
"componentSets": [
  {
    "type": "your-component-type",
    "sourcePath": "path/to/components",
    "configFile": "your-config.json"
  }
]
```

## Existing Component Sets

The system currently includes two component sets:

1. **system-prompt**: Assembles the system prompt from component files
   - Location: `1-handoff-custom-mode/components`
   - Config: `system-prompt-config.json`

2. **source-code**: Contains modular source code functions for the installer
   - Location: `handoff-publisher/lib/src`
   - Config: `src-config.json`

## Loading and Processing Components

Components are loaded and processed in the order specified in their configuration file. The publisher framework:

1. Reads the component set configuration
2. Loads each component in the specified order
3. Processes the components according to their type
4. Integrates the processed components into the final output

## Best Practices

1. Keep components small and focused on a single responsibility
2. Use meaningful numbering to indicate dependencies and loading order
3. Include a detailed description for each component
4. Handle errors appropriately in the configuration
5. Test components individually and as part of the whole system