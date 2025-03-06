# Handoff Manager System Components

This directory contains the Markdown component files used to construct the Handoff Manager system prompt. Using Markdown instead of plain text makes the components more structured and readable, with enhanced formatting capabilities for better explanation of concepts.

## Structure

The system uses the following structure:

```
.roo/
└── components/              # System prompt Markdown components
    ├── header.md            # Basic role definition
    ├── directory-detection.md
    ├── restoration-flowchart.md
    ├── creation-flowchart.md
    ├── handoff-creation.md
    ├── milestone-creation.md
    ├── session-restoration.md
    ├── conversation-extraction.md
    ├── numbering-logic.md
    └── safety-rules.md
```

## Component Details

Each Markdown component serves a specific purpose in the overall system:

| Component | Purpose |
|-----------|---------|
| `header.md` | Defines the basic role and responsibilities |
| `directory-detection.md` | Logic for finding/creating handoff directories |
| `restoration-flowchart.md` | Visual workflow for session restoration |
| `creation-flowchart.md` | Visual workflow for handoff/milestone creation |
| `handoff-creation.md` | Detailed structure and requirements for handoffs |
| `milestone-creation.md` | Procedures for milestone creation |
| `session-restoration.md` | Process for restoring context from documents |
| `conversation-extraction.md` | Integration with conversation analysis |
| `numbering-logic.md` | Robust sequential numbering procedures |
| `safety-rules.md` | Error prevention and safety guidelines |

## Markdown Benefits

Using Markdown for the components provides several advantages:

1. **Enhanced Formatting**: Tables, lists, and headers make information more structured
2. **Visual Elements**: Flowcharts and diagrams rendered through Mermaid
3. **Code Blocks**: Properly formatted code examples with syntax highlighting
4. **Callouts**: Important notes, warnings, and best practices are visually distinct
5. **Better Readability**: Both for humans reviewing the components and the LLM interpreting them

## Assembly Process

The `create-handoff-manager.js` script in the parent directory assembles these Markdown components into a single system prompt file. The components are assembled in a specific order to ensure proper context and flow.

## Modification Guidelines

When modifying components:

1. **Independent Changes**: Each component can be modified independently without affecting others
2. **Cross-References**: Be careful about cross-referencing between components
3. **Assembly Order**: The order of components matters - they build on one another
4. **Run the Generator**: After any changes, run `node create-handoff-manager.js` to rebuild the system prompt
5. **Markdown Formatting**: Leverage Markdown features to make the content more understandable

## Adding New Components

To add a new component:

1. Create a new Markdown file in the components directory
2. Add the component name to the `componentFiles` array in `create-handoff-manager.js`
3. Run the generator script to incorporate the new component