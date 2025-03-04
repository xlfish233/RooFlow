# Custom System Prompts in Roo-Code: A User Guide

## What Are Custom System Prompts?

Custom system prompts are a powerful feature that lets you completely replace Roo's default instructions with your own. While custom rules (`.clinerules`) add to Roo's behavior, custom system prompts give you full control over how Roo operates at a fundamental level.

## Custom System Prompts vs. Custom Rules

| Feature | Custom Rules (`.clinerules`) | Custom System Prompts |
|---------|------------------------------|------------------------|
| **What they do** | Add guidelines to the standard system | Replace the entire system prompt |
| **How they work** | Added to USER'S CUSTOM INSTRUCTIONS section | Override core behavior sections |
| **Ease of use** | Simpler, less can go wrong | More powerful but requires more care |
| **When to use** | For most customization needs | When you need complete control |

## Setting Up Custom System Prompts

1. Create a `.roo` folder in your project's root directory
2. Create a file named `system-prompt-[mode]` inside that folder
   - For example: `.roo/system-prompt-code` for Code mode
3. Write your custom instructions in that file

## What's Preserved and What's Replaced

When using a custom system prompt:

**Preserved:**
- The role definition from your mode
- Any custom instructions

**Replaced:**
- All core sections (TOOL USE, CAPABILITIES, MODES, RULES)
- Default behavior patterns

## What You're Replacing and the Tradeoffs

Using custom system prompts means you're taking on significant responsibility by replacing the standard instructions that guide Roo's behavior.

### Standard Sections You're Replacing

1. **TOOL USE**: How Roo should use tools like `read_file`, `write_to_file`, etc.
   ```
   Example of what you're replacing:
   
   TOOL USE
   
   You have access to tools that let you read files, modify code,
   execute commands, etc. Use one tool per message, and wait for
   the result before proceeding.
   ```

2. **CAPABILITIES**: What Roo can and cannot do
3. **MODES**: How different modes behave
4. **RULES**: Core guidelines for behavior
5. **SYSTEM INFORMATION**: Details about the environment
6. **OBJECTIVE**: How to approach tasks

### The Tradeoff Balance

**Benefits:**
- Complete control over Roo's behavior
- Can create highly specialized assistants
- Can implement custom methodologies
- Save context tokens by removing unnecessary sections

**Costs:**
- Need to provide your own tool instructions
- Lose default safety mechanisms
- Won't automatically benefit from Roo updates
- More prone to errors if instructions are incomplete
- More maintenance work when updating Roo

## Example Use Cases

### 1. Specialized Development Methodologies

Create custom prompts that enforce specific methodologies:
- Test-Driven Development
- Domain-Driven Design
- Behavior-Driven Development

### 2. Domain-Specific Assistance

Make Roo specialized in particular fields:
- Security code review
- Accessibility compliance
- Performance optimization
- Game development

### 3. Custom Workflows

Create custom workflows that guide Roo through specific processes:
- Code review patterns
- Documentation generation
- Learning-oriented development

## How to Structure a Custom System Prompt

Your custom system prompt should:

1. Start with the role definition (automatically preserved)
2. Use `====` to separate sections
3. Include any sections that are critical for your intended use
4. Define how tools should be used
5. End with your custom instructions (automatically preserved)

## Best Practices

1. **Start Small**: Begin by customizing a single mode rather than all of them
2. **Test Thoroughly**: Verify your custom prompt works as expected
3. **Don't Forget Tools**: Make sure to include instructions for tool usage
4. **Use Version Control**: Keep your custom prompts in source control
5. **Document Your Changes**: Help others understand your customizations

## Pairing with Other Features

For maximum effect, combine custom system prompts with:

1. Custom modes in `.roomodes`
2. Mode-specific rules in `.clinerules-[mode]`
3. Global rules in `.clinerules`

## Things to Watch Out For

1. **Tool Permissions**: Custom prompts don't override tool permissions from mode configuration
2. **Missing Instructions**: Omitting critical instructions may cause unexpected behavior
3. **Context Window**: Very large custom prompts reduce available tokens for conversation
4. **Updates**: Custom prompts may need updating when Roo-Code is updated

## Conclusion

Custom system prompts are the most powerful way to customize Roo-Code for specialized purposes. While they require more care than simple custom rules, they allow you to transform Roo into a highly specialized assistant tailored exactly to your needs.