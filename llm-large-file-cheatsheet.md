# LLM Large File Handling Cheatsheet

Large files can "brick" an LLM by exceeding its context window. Use these techniques instead of loading entire files.

## Python One-liners

```python
# First N lines with line numbers
python -c "with open('file.txt') as f: [print(f'{i+1}: {l.strip()}') for i,l in enumerate(f) if i<50]"

# Count lines matching pattern
python -c "import re; print(len(re.findall(r'ERROR', open('log.txt').read())))"

# Estimate tokens (rough approximation)
python -c "print(f'~{len(open(\"file.txt\").read())//4:,} tokens')"

# Extract JSON fields without loading entire file
python -c "import json; print(json.load(open('large.json'))['key']['subkey'])"
```

## Bash One-liners

```bash
# First/last lines
head -n 20 file.txt
tail -n 20 file.txt

# Extract specific lines
sed -n '100,120p' file.txt

# Count occurrences
grep -c "ERROR" log.txt

# Extract with context
grep -A 3 -B 2 "Exception" log.txt
```

## Node.js One-liners

```javascript
// Count lines
node -e "require('fs').createReadStream('file.txt').on('data',c=>n+=(c.toString().match(/\\n/g)||[]).length).on('end',()=>console.log(n))"

// First N lines
node -e "const rl=require('readline').createInterface({input:require('fs').createReadStream('file.txt')});let i=0;rl.on('line',l=>{if(i++<10)console.log(l);else rl.close()})"

// Extract JSON property
node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('config.json'));console.log(data.property)"
```

## PowerShell One-liners

```powershell
# First/last N lines
Get-Content file.txt -TotalCount 20
Get-Content file.txt -Tail 20

# Find and extract
Get-Content log.txt | Select-String "ERROR" -Context 2,2

# Count by type
Get-Content log.txt | Select-String "(INFO|ERROR|WARN)" | Group-Object {$_.Matches[0].Value} | Select-Object Name,Count
```

## One-Line Snippets (Recommended)

### Python: JSON Structure Analyzer (5 lines)

```python
def analyze_json(path):
    import json, os
    with open(path, 'rb') as f: sample = f.read(1000).decode('utf-8', 'replace')
    structure = 'object' if sample.strip().startswith('{') else 'array' if sample.strip().startswith('[') else 'unknown'
    keys = set(k for k in sample.split('"') if ':' in sample.split(k)[1][:5])
    return {'size_mb': os.path.getsize(path)/1048576, 'structure': structure, 'keys': list(keys)[:5]}
```

### Python: Token Estimator (3 lines)

```python
def estimate_tokens(path):
    import os
    sample = open(path, 'r', errors='ignore').read(50000)
    return {'tokens_approx': len(sample)//4 * (os.path.getsize(path)/len(sample)), 'size_mb': os.path.getsize(path)/1048576}
```

### Node.js: Log Analyzer (5 lines)

```javascript
const analyzeLog = (path) => {
  const fs = require('fs');
  const sample = fs.readFileSync(path, {encoding: 'utf-8', flag: 'r'}).slice(0, 10000);
  const counts = {error: (sample.match(/ERROR/g) || []).length, warn: (sample.match(/WARN/g) || []).length, info: (sample.match(/INFO/g) || []).length};
  return {counts, size: fs.statSync(path).size / (1024 * 1024) + 'MB', lines: sample.split('\n').length};
};
```

### Bash: CSV Field Counter (1 line)

```bash
csv_fields() { head -1 "$1" | tr ',' '\n' | wc -l; }
```

### PowerShell: XML Tag Counter (3 lines)

```powershell
function Get-XmlTagCount($path) {
    [xml]$sample = Get-Content $path -TotalCount 1000 -ErrorAction SilentlyContinue
    return $sample.SelectNodes("//*") | Group-Object Name | Sort-Object Count -Descending | Select-Object Name, Count -First 10
}
```

## Creative Examples

### Python: Find Duplicate Lines (1 line)

```python
python -c "from collections import Counter; print(Counter(open('file.txt').read().splitlines()).most_common(5))"
```

### Python: Extract Email Addresses (1 line)

```python
python -c "import re; print(set(re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', open('contacts.txt').read())))"
```

### Bash: Find Largest JSON Objects (2 lines)

```bash
find_large_json_objects() { grep -o '{[^{}]*}' "$1" | awk '{ print length, $0 }' | sort -nr | head -5; }
```

### Node.js: Extract URL Domains (1 line)

```javascript
node -e "const urls=require('fs').readFileSync('urls.txt','utf8').match(/https?:\\/\\/([^\\s/]+)/g)||[];console.log([...new Set(urls.map(u=>new URL(u).hostname))].slice(0,10))"
```

### PowerShell: Find Files Modified Today (1 line)

```powershell
Get-ChildItem -Recurse | Where-Object {$_.LastWriteTime -gt (Get-Date).Date} | Select-Object FullName, Length | Sort-Object Length -Descending
```

### Python: Summarize CSV Data (5 lines)

```python
def summarize_csv(path):
    import csv
    with open(path, 'r') as f: reader = csv.reader(f); headers = next(reader); rows = [row for _, row in zip(range(100), reader)]
    col_types = ['numeric' if all(c.replace('.','',1).isdigit() for c in [r[i] for r in rows if i < len(r) and r[i]]) else 'text' for i in range(len(headers))]
    col_samples = [[r[i] for r in rows if i < len(r) and r[i]][:3] for i in range(len(headers))]
    return {'headers': headers, 'types': dict(zip(headers, col_types)), 'samples': dict(zip(headers, col_samples)), 'row_count_sample': len(rows)}
```

### Python: AST Analysis of Large Python File (5 lines)

```python
def analyze_python_ast(path):
    import ast, os
    with open(path, 'r') as f: tree = ast.parse(f.read())
    classes = {node.name: len(node.body) for node in ast.walk(tree) if isinstance(node, ast.ClassDef)}
    functions = {node.name: len(node.body) for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)}
    return {'file_size_mb': os.path.getsize(path)/1048576, 'classes': sorted(classes.items(), key=lambda x: x[1], reverse=True)[:5], 'functions': sorted(functions.items(), key=lambda x: x[1], reverse=True)[:5]}
```

### JavaScript: Find Complex Functions (1 line)

```javascript
node -e "const fs=require('fs');const code=fs.readFileSync(process.argv[2],'utf8');const funcs=code.match(/function\\s+([^(]+)\\s*\\([^)]*\\)\\s*\\{[^}]*\\}/g)||[];console.log(funcs.map(f=>({name:f.match(/function\\s+([^(]+)/)[1],lines:f.split('\\n').length})).sort((a,b)=>b.lines-a.lines).slice(0,5))"
```

### Python: Analyze God Class (3 lines)

```python
def find_god_class_methods(path):
    import re, os
    methods = re.findall(r'def\s+([^\(]+)\(self', open(path, 'r').read())
    return {'file_size_mb': os.path.getsize(path)/1048576, 'method_count': len(methods), 'methods': methods[:10]}
```

### Python: Extract Markdown Headers (1 line)

```python
python -c "import re; print('\n'.join([f\"{'#'*len(m.group(1))} {m.group(2)}\" for m in re.finditer(r'^(#+)\s+(.+)$', open('README.md').read(), re.MULTILINE)]))"
```

### Bash: List Markdown Headers (1 line)

```bash
grep -E "^#{1,6} " README.md | sed -E "s/^(#+) (.+)/\1 \2/"
```

### PowerShell: Extract Markdown Structure (1 line)

```powershell
Get-Content README.md | Select-String -Pattern "^#{1,6} " | ForEach-Object { $_.Line }
```

### Python: Recursive Markdown Header Explorer (5 lines)

```python
def explore_markdown_headers(directory='.'):
    import os, re
    results = {}
    for root, _, files in os.walk(directory):
        for file in [f for f in files if f.endswith('.md')]:
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='replace') as f:
                headers = re.findall(r'^(#+)\s+(.+)$', f.read(), re.MULTILINE)
                if headers: results[path] = [f"{'#'*len(h[0])} {h[1]}" for h in headers]
    return results
```

### Bash: Recursive Markdown Summary (3 lines)

```bash
find_md_headers() {
  find "${1:-.}" -type f -name "*.md" -print0 | while IFS= read -r -d '' file; do
    echo -e "\n## $file"; grep -E "^#{1,6} " "$file" | sed -E "s/^(#+)/  \1/";
  done
}
```

### PowerShell: Directory Markdown Map (3 lines)

```powershell
function Get-MarkdownMap($path = ".") {
    Get-ChildItem -Path $path -Recurse -Filter "*.md" | ForEach-Object {
        Write-Output "`n## $($_.FullName)"; Get-Content $_.FullName | Select-String -Pattern "^#{1,6} " | ForEach-Object { "  " + $_.Line }
    }
}
```

## Prompt Templates

When asking an LLM to handle a large file, use these templates:

```
Create a one-liner to extract [specific info] from [filename] without loading the entire file.
```

```
Write and execute a streaming snippet to analyze [filename] and return only [specific results].
```

```
Generate a command to count [patterns/occurrences] in [filename] without exceeding context limits.
```

## Rules for LLMs

1. NEVER attempt to read entire large files into context
2. Create and execute scripts instead of direct file reading
3. Use one-liners when possible (1-5 lines ideal, 10 max)
4. Return only the specific information requested
5. Use only standard library packages
6. Handle errors gracefully with clear messages

## Snippet Design Principles

1. **Keep snippets extremely short**
   - 1-5 lines is ideal, maximum 10 lines
   - If longer than 10 lines, write a script file instead
   - Each snippet should do exactly one thing
   - One-liners are preferred when possible

2. **Minimize console output**
   - Don't print every line or iteration
   - Return aggregate results instead of verbose logging
   - Use structured return values (dicts/objects) over print statements

3. **Solve, don't create problems**
   - Dependencies are strictly forbidden
   - Use only packages available in the standard library
   - Handle encoding errors gracefully
   - Use try/except blocks for file operations
   - Provide clear error messages if issues occur

4. **Be smart about memory usage**
   - Process in chunks or line-by-line when appropriate
   - Build in-memory collections only when necessary for analysis
   - Release resources (close files) as soon as possible
   - Balance memory usage with functionality needs