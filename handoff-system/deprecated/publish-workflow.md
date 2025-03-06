# Handoff System Publisher Script Workflow

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#333', 'primaryTextColor': '#fff', 'lineColor': '#666'}}}%%
flowchart TD
    Start([ 1 - Start Publisher Script]) --> ReadConfig[ 2 - Read Configuration Files<br>publish-config.json]
    
    ReadConfig --> AssemblePrompt[ 3 - Assemble System Prompt<br>from .roo/components/system-prompt-config.json]
    
    AssemblePrompt --> ProcessRootFiles[ 4 - Process Root Files<br>.roomodes, .clinerules, README.md]
    ProcessRootFiles --> ProcessInstructions[ 5 - Process Instructions Directory<br>handoffs/0-instructions]
    ProcessInstructions --> ProcessScripts[ 6 - Process Scripts Directory<br>handoffs/scripts]
    
    ProcessScripts --> GenerateInstaller[ 7 - Generate & Write Installer<br>with Embedded Files]
    
    GenerateInstaller --> DisplaySuccess[ 8 - Display Success Message]
    DisplaySuccess --> End([ 9 - End Publisher Script])
```

This flowchart represents the high-level operational flow of the publisher script. The script reads configuration, assembles the system prompt according to the component config, processes required files in specific categories, and generates a self-contained installer.