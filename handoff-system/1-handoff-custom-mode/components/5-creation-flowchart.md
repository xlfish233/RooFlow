
====

# Handoff Creation Workflow

Follow this detailed workflow diagram when creating handoffs or milestones:

```mermaid
graph TD
    Start[Begin Handoff Process] --> CheckEligibility{Is Handoff<br>Needed?}
    CheckEligibility -->|No| SuggestContinue[Suggest Continuing<br>Current Work]
    SuggestContinue --> End
    
    CheckEligibility -->|Yes| CheckExtraction{Conversation<br>Extract Available?}
    
    CheckExtraction -->|Yes| ProcessExtract[Process Conversation<br>Extract]
    CheckExtraction -->|No| SkipExtract[Continue Without<br>Conversation Extract]
    
    ProcessExtract --> ExamineDirectory[Examine Handoff<br>Directory Structure]
    SkipExtract --> ExamineDirectory
    
    ExamineDirectory --> CheckFiles{Root Handoff<br>Files Exist?}
    
    CheckFiles -->|Yes| CountHandoffs[Count Existing<br>Handoff Documents]
    CheckFiles -->|No| CreateFirst[Create First<br>Handoff Document]
    CreateFirst --> End
    
    CountHandoffs --> CheckMilestone{3-5 Handoffs<br>Accumulated?}
    
    CheckMilestone -->|No| CreateHandoff[Create Next<br>Sequential Handoff]
    CreateHandoff --> End
    
    CheckMilestone -->|Yes| SuggestMilestone[Suggest Creating<br>Milestone]
    SuggestMilestone --> UserResponse{User Wants<br>Milestone?}
    
    UserResponse -->|No| CreateHandoff
    UserResponse -->|Yes| VerifyFinalHandoff{Recent Final<br>Handoff Exists?}
    
    VerifyFinalHandoff -->|No| CreateFinalHandoff[Create Final Handoff<br>Before Milestone]
    VerifyFinalHandoff -->|Yes| CalculateNextNumber[Calculate Next<br>Milestone Number]
    
    CreateFinalHandoff --> CalculateNextNumber
    
    CalculateNextNumber --> CreateMilestoneDir[Create Milestone<br>Directory]
    CreateMilestoneDir --> MoveHandoffs[Move Handoff Files<br>to Milestone Dir]
    MoveHandoffs --> CreateSummary[Create Milestone<br>Summary & Lessons]
    CreateSummary --> CleanupReminders[Remind About<br>Next Steps]
    CleanupReminders --> End[Process Complete]
```

## Creation Decision Points

At each decision point in the workflow:

### 1. Handoff Eligibility Check
Evaluate if a handoff is needed based on criteria:

| Criteria | Description |
|----------|-------------|
| Context Relevance | Context becomes ~30% irrelevant to current task |
| Project Progress | Completing significant project segments |
| Conversation Length | After 10+ conversation exchanges |
| Debugging Duration | During debugging sessions exceeding 5 exchanges without resolution |

### 2. Conversation Extract Processing
If a conversation extract is available, analyze it to identify:
- Discoveries made
- Problems and solutions
- Work in progress

> **Note:** This is optional - proceed without it if not available

### 3. Directory Structure Analysis
- Examine the handoff directory to determine the next steps
- Check if it's a brand new setup or existing structure
- Identify milestone directories and handoff files

### 4. Milestone Recommendation
- After 3-5 handoffs accumulate, suggest creating a milestone
- The user makes the final decision on whether to proceed

> **Best Practice:** Always create a final handoff before creating a milestone to ensure all recent work is captured.