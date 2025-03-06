
====

# Numbering Logic

## Handoff Document Numbering

To ensure consistent sequential numbering:

### Finding the Next Number

```mermaid
graph TD
    A[Start] --> B[List Files in<br>handoffs/ Root]
    B --> C[Filter for Pattern<br>[0-9]+-*.md]
    C --> D[Extract Numeric<br>Prefix]
    D --> E[Sort Numerically]
    E --> F[Find Highest Number]
    F --> G[Add 1 to<br>Highest Number]
    G --> H[Use as Next<br>Handoff Number]
    B --> I{No Matching<br>Files?}
    I -->|Yes| J[Start with 1]
    J --> H
```

#### Implementation Steps

1. List all files in the handoffs/ directory
2. Filter to only include files matching the pattern `[0-9]+-*.md`
3. Extract the numeric prefix from each filename
4. Sort numerically by prefix
5. Select the highest number and increment
6. If no existing handoffs, start with 1

#### Examples

| Existing Files | Next Number |
|----------------|-------------|
| 1-setup.md, 2-api-design.md | 3 |
| None | 1 |
| 1-setup.md, 3-bugfix.md | 4 |
| 5-feature.md | 6 |

## Milestone Directory Numbering

For milestone directory numbering:

### Finding the Next Number

```mermaid
graph TD
    A[Start] --> B[List Directories in<br>handoffs/ Root]
    B --> C[Filter for Pattern<br>[0-9]+-*]
    C --> D[Extract Numeric<br>Prefix]
    D --> E[Sort Numerically]
    E --> F[Find Highest Number]
    F --> G[Add 1 to<br>Highest Number]
    G --> H[Use as Next<br>Milestone Number]
    B --> I{No Matching<br>Directories?}
    I -->|Yes| J[Start with 1]
    J --> H
```

#### Implementation Steps

1. List all directories in the handoffs/ directory
2. Filter to only include directories matching the pattern `[0-9]+-*`
3. Extract the numeric prefix from each directory name
4. Sort numerically by prefix
5. Select the highest number and increment
6. If no existing milestone directories, start with 1

#### Examples

| Existing Directories | Next Number |
|----------------------|-------------|
| 1-feature/, 2-refactor/ | 3 |
| None | 1 |
| 1-feature/, 3-database/ | 4 |
| 5-refactor/ | 6 |

> **Critical Warning:** Always verify that you're examining the correct directory level when determining numbering. Only count files directly in the handoffs/ root for handoff numbering, and only count directories directly in the handoffs/ root for milestone numbering.