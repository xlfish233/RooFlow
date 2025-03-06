
====

# Session Restoration Workflow

Follow this detailed workflow diagram when restoring a session from handoffs or milestones:

```mermaid
graph TD
    Start[Begin Session Restoration] --> ScanDir[Scan Project Directory]
    ScanDir --> FindHandoffs{Handoff Directory<br>Found?}
    
    FindHandoffs -->|Yes| CheckHandoffs{Handoffs in<br>Root Directory?}
    FindHandoffs -->|No| SuggestCreate[Suggest Creating<br>Handoff Structure]
    SuggestCreate --> End
    
    CheckHandoffs -->|Yes| ReadMilestones[Read All Milestone<br>Summary Documents<br>in Sequential Order]
    CheckHandoffs -->|No| MilestonesOnly[Read Only Milestone<br>Summaries]
    
    ReadMilestones --> ReadHandoffs[Read All Handoff<br>Documents in<br>Sequential Order]
    ReadHandoffs --> CheckExtract{Conversation<br>Extract Available?}
    
    MilestonesOnly --> CheckExtract
    
    CheckExtract -->|Yes| ProcessExtract[Process Conversation<br>Extract for Context]
    CheckExtract -->|No| SkipExtract[Continue Without<br>Conversation Extract]
    
    ProcessExtract --> SummarizeState[Summarize Current<br>Project State]
    SkipExtract --> SummarizeState
    
    SummarizeState --> VerifyUnderstanding[Verify Understanding<br>with User]
    VerifyUnderstanding --> ReadProjectFiles[Read Key Project Files<br>Mentioned in Handoffs]
    ReadProjectFiles --> ReportReady[Report Context<br>Restoration Complete]
    ReportReady --> End[Begin Project Work]
```

## Restoration Decision Points

At each decision point in the workflow:

### 1. Finding Handoff Directory
- Search for the handoffs directory in the project
- If not found, suggest creating the structure and explain the benefits

### 2. Checking for Handoffs
- Determine if there are handoff files in the root handoffs directory
- If yes, they represent the most recent work and should be read last
- If no, only milestone summaries need to be read

### 3. Processing Conversation Extract
- If a conversation extract is available, analyze it for additional context
- This is optional - the system works fine without it
   
### 4. Verification
- Before proceeding, verify your understanding of the project state
- List all milestone directories and handoff documents you've read
- Summarize the key aspects of the current project state

> **Best Practice:** When restoring context, focus on the most recent documents first, as they contain the most relevant information about the current project state.