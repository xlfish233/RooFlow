/**
 * Handoff Manager Standalone Installer Publisher
 * 
 * This script generates a single, standalone JavaScript file that can be used to
 * install the handoff manager in any environment. The output file contains all
 * the necessary files and logic to create the complete handoff manager system.
 * 
 * Configuration is stored in publish-config.json, making it easy to maintain
 * without modifying this script.
 * 
 * Usage:
 *   node publish-standalone-installer.js [output-file]
 *   
 * If output-file is not specified, it uses the ones defined in publish-config.json
 */

const fs = require('fs');
const path = require('path');

// Get the script directory path
const scriptDir = __dirname;
// Load configuration
const configPath = path.join(scriptDir, 'publish-config.json');
let config;

try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configContent);
  console.log('Loaded configuration from publish-config.json');
} catch (err) {
  console.error(`Error loading configuration: ${err.message}`);
  process.exit(1);
}

// Project root directory
const projectRoot = path.resolve(scriptDir, '..');

// Source directory
const sourceDir = path.resolve(scriptDir, config.sourceDir);

// Output files (either specified by user or from config)
const outputFiles = process.argv[2] 
  ? [path.resolve(process.argv[2])]
  : (config.outputFiles || []).map(file => path.resolve(scriptDir, file));

console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║      Handoff Manager Standalone Publisher        ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);

console.log(`Reading from: ${sourceDir}`);
console.log(`Publishing to: ${outputFiles.join(', ')}`);
console.log(`Version: ${config.version}`);

/**
 * Check if a file should be excluded based on patterns
 * @param {string} filePath - Path to check
 * @param {Array<string>} patterns - Exclusion patterns
 * @returns {boolean} - True if file should be excluded
 */
function shouldExcludeFile(filePath, patterns) {
  if (!patterns || !patterns.length) return false;
  
  const filename = path.basename(filePath);
  
  // Check patterns
  for (const pattern of patterns) {
    // Simple wildcard pattern matching
    if (pattern.startsWith('*') && filename.endsWith(pattern.slice(1))) {
      return true;
    }
    // Direct match
    if (pattern === filename) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a file should be excluded based on directory exclusions
 * @param {string} filePath - Path relative to source directory
 * @param {Array<object>} directories - Directory configurations
 * @returns {boolean} - True if file should be excluded
 */
function isExcludedByDirectoryConfig(filePath, directories) {
  for (const dir of directories) {
    if (!dir.exclude || !dir.exclude.length) continue;
    
    // Check if file is in this directory
    const dirPath = dir.source.replace(/\\/g, '/');
    if (filePath.startsWith(dirPath)) {
      const filename = path.basename(filePath);
      if (dir.exclude.includes(filename)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Read a file and encode it to a JavaScript string literal
 * @param {string} filePath - Path to the file
 * @returns {string} - JavaScript string representation of file content
 */
function encodeFileToString(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Escape special characters for JavaScript string
    const escaped = content
      .replace(/\\/g, '\\\\')     // Escape backslashes
      .replace(/`/g, '\\`')       // Escape backticks
      .replace(/\$/g, '\\$');     // Escape dollar signs
    
    return escaped;
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
    return '';
  }
}

/**
 * Recursively collect all files in a directory
 * @param {string} dir - Directory path
 * @param {string} baseDir - Base directory for relative paths
 * @param {Object} result - Object to collect file paths
 * @returns {Object} - Object with file paths and contents
 */
function collectFiles(dir, baseDir, result = {}) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      
      if (entry.isDirectory()) {
        collectFiles(fullPath, baseDir, result);
      } else {
        // Skip files that match exclusion patterns
        if (shouldExcludeFile(fullPath, config.excludePatterns)) {
          console.log(`- Skipping excluded file: ${relativePath}`);
          continue;
        }
        
        // Skip files that are excluded by directory config
        if (isExcludedByDirectoryConfig(relativePath, config.directories)) {
          console.log(`- Skipping directory-excluded file: ${relativePath}`);
          continue;
        }
        
        // Skip files that are too large
        const stats = fs.statSync(fullPath);
        if (stats.size > config.maxFileSize) {
          console.log(`- Skipping file (too large): ${relativePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
          continue;
        }
        
        result[relativePath] = encodeFileToString(fullPath);
      }
    }
    
    return result;
  } catch (err) {
    console.error(`Error collecting files from ${dir}: ${err.message}`);
    return result;
  }
}

/**
 * Ensure directory exists for file
 * @param {string} filePath - Path to file
 */
function ensureDirectoryForFile(filePath) {
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`- Created directory: ${dir}`);
  }
}

/**
 * Generate the standalone installer file
 */
function generateStandaloneInstaller() {
  try {
    console.log(`\nCollecting files from ${sourceDir}...`);
    
    // Collect all files from source directory
    const fileContents = {};
    
    // Root configuration files
    for (const rootFile of config.rootFiles) {
      const filePath = path.join(sourceDir, rootFile);
      if (fs.existsSync(filePath)) {
        fileContents[rootFile] = encodeFileToString(filePath);
      } else {
        console.warn(`- Warning: Root file not found: ${rootFile}`);
      }
    }
    
    // Collect files from specified directories
    for (const directory of config.directories) {
      const dirPath = path.join(sourceDir, directory.source);
      if (fs.existsSync(dirPath)) {
        const files = collectFiles(dirPath, sourceDir);
        Object.assign(fileContents, files);
      } else {
        console.warn(`- Warning: Directory not found: ${directory.source}`);
      }
    }
    
    console.log(`- Collected ${Object.keys(fileContents).length} files`);
    
    // Build the output file content
    const outputContent = `#!/usr/bin/env node
/**
 * Handoff Manager Standalone Installer (v${config.version})
 * 
 * This is a self-contained script that installs the complete Handoff Manager system.
 * It includes all necessary files and will create the proper directory structure.
 * 
 * Generated from configuration by publish-standalone-installer.js
 * 
 * Usage:
 *   node handoff-manager-installer.js [target-directory]
 * 
 * If target-directory is not specified, it uses the current directory.
 */

const fs = require('fs');
const path = require('path');

// Get the script directory path
const scriptDir = __dirname;
// Get target directory (either specified by user or current directory)
const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

console.log(\`
╔══════════════════════════════════════════════════╗
║                                                  ║
║            Handoff Manager Installer             ║
║                                                  ║
╚══════════════════════════════════════════════════╝
\`);

console.log(\`Installing Handoff Manager v${config.version} to: \${targetDir}\`);

// Files to be created (stored as normalized paths)
const FILES = {
${Object.entries(fileContents)
  .map(([filePath, content]) => `  "${filePath}": \`${content}\``)
  .join(',\n')}
};

// Configuration for installation
const CONFIG = ${JSON.stringify({
  directories: config.directories,
  installOptions: config.installOptions,
  nextSteps: config.nextSteps,
  documentation: config.documentation
}, null, 2)};

// Create directories if they don't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(\`- Created directory: \${dirPath}\`);
    return true;
  }
  return false;
}

/**
 * Back up an existing directory by renaming it
 * @param {string} dirPath - Path to the directory to back up
 * @returns {string|null} - The backup path or null if no backup needed
 */
function backupDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return null; // No backup needed
  }
  
  // Base backup name
  let backupPath = \`\${dirPath}-backup\`;
  
  // Check if the backup name already exists
  if (fs.existsSync(backupPath)) {
    // Find the next available numbered backup
    let counter = 1;
    while (fs.existsSync(\`\${backupPath}-\${counter}\`)) {
      counter++;
    }
    backupPath = \`\${backupPath}-\${counter}\`;
  }
  
  try {
    // Rename the directory to the backup path
    fs.renameSync(dirPath, backupPath);
    console.log(\`- Backed up existing directory: \${dirPath} → \${backupPath}\`);
    return backupPath;
  } catch (err) {
    console.error(\`- Error backing up directory \${dirPath}: \${err.message}\`);
    return null;
  }
}

// Function to merge custom modes from two .roomodes files
function mergeRoomodes(existingPath, newPath, outputPath) {
  try {
    // Read existing .roomodes if it exists
    let mergedContent = { customModes: [] };
    
    if (fs.existsSync(existingPath)) {
      const existingContent = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      
      // Import existing custom modes
      if (existingContent.customModes && Array.isArray(existingContent.customModes)) {
        // Filter out any existing handoff-manager mode
        mergedContent.customModes = existingContent.customModes.filter(
          mode => mode.slug !== 'handoff-manager'
        );
      }
    }
    
    // Read new .roomodes
    if (fs.existsSync(newPath)) {
      const newContent = JSON.parse(fs.readFileSync(newPath, 'utf8'));
      
      // Add handoff-manager mode
      if (newContent.customModes && Array.isArray(newContent.customModes)) {
        const handoffManagerMode = newContent.customModes.find(
          mode => mode.slug === 'handoff-manager'
        );
        
        if (handoffManagerMode) {
          mergedContent.customModes.push(handoffManagerMode);
        }
      }
    }
    
    // Write merged content
    fs.writeFileSync(outputPath, JSON.stringify(mergedContent, null, 2));
    console.log('- Successfully merged .roomodes file');
    return true;
  } catch (err) {
    console.error(\`- Error merging .roomodes files: \${err.message}\`);
    return false;
  }
}

// Function to merge .clinerules files
function mergeClinerules(existingPath, newPath, outputPath) {
  try {
    let mergedContent = '';
    
    // Read existing .clinerules if it exists
    if (fs.existsSync(existingPath)) {
      const existingContent = fs.readFileSync(existingPath, 'utf8');
      
      // Check if handoff system rules already exist
      if (!existingContent.includes('Handoff System Rules')) {
        mergedContent = existingContent;
        
        // Add blank line if needed
        if (!mergedContent.endsWith('\\n\\n')) {
          if (mergedContent.endsWith('\\n')) {
            mergedContent += '\\n';
          } else {
            mergedContent += '\\n\\n';
          }
        }
      } else {
        // If handoff rules exist, keep existing content
        mergedContent = existingContent;
        console.log('- Handoff System Rules already exist in .clinerules, preserving existing content');
        return true;
      }
    }
    
    // Add new rules
    if (fs.existsSync(newPath)) {
      const newContent = fs.readFileSync(newPath, 'utf8');
      mergedContent += newContent;
    }
    
    // Write merged content
    fs.writeFileSync(outputPath, mergedContent);
    console.log('- Successfully updated .clinerules file');
    return true;
  } catch (err) {
    console.error(\`- Error merging .clinerules files: \${err.message}\`);
    return false;
  }
}

// Function to write all files from the FILES object
function writeAllFiles(targetDir) {
  console.log('\\nWriting files...');
  
  for (const [filePath, content] of Object.entries(FILES)) {
    try {
      // Get the full path
      const fullPath = path.join(targetDir, filePath);
      
      // Create directory if it doesn't exist
      const dirPath = path.dirname(fullPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Write the file
      fs.writeFileSync(fullPath, content);
      console.log(\`- Created: \${filePath}\`);
    } catch (err) {
      console.error(\`- Error writing file \${filePath}: \${err.message}\`);
    }
  }
}

// Main installation function
async function installHandoffManager() {
  try {
    // Write all files to the target directory
    writeAllFiles(targetDir);
    
    // Create handoffs directory if it doesn't exist
    const targetHandoffsDir = path.join(targetDir, 'handoffs');
    ensureDir(targetHandoffsDir);
    
    // Handle directories that need backup
    const backupPaths = {};
    
    for (const directory of CONFIG.directories) {
      if (directory.backup && CONFIG.installOptions.createBackups) {
        const targetDirPath = path.join(targetDir, directory.target);
        const backupPath = backupDirectory(targetDirPath);
        
        if (backupPath) {
          backupPaths[directory.target] = backupPath;
          console.log(\`- Note: Previous directory backed up to \${path.basename(backupPath)}\`);
        }
      }
    }
    
    // Merge configuration files if needed
    if (CONFIG.installOptions.mergeRoomodes) {
      const existingRoomodesPath = path.join(targetDir, '.roomodes');
      const targetRoomodesPath = path.join(targetDir, '.roomodes');
      
      console.log('\\nConfiguring custom modes...');
      if (fs.existsSync(existingRoomodesPath)) {
        mergeRoomodes(existingRoomodesPath, targetRoomodesPath, targetRoomodesPath);
      }
    }
    
    if (CONFIG.installOptions.mergeClinerules) {
      const existingClinerules = path.join(targetDir, '.clinerules');
      const targetClinerules = path.join(targetDir, '.clinerules');
      
      console.log('\\nConfiguring handoff rules...');
      if (fs.existsSync(existingClinerules)) {
        mergeClinerules(existingClinerules, targetClinerules, targetClinerules);
      }
    }
    
    // Display success message and next steps
    console.log(\`
╔══════════════════════════════════════════════════╗
║                                                  ║
║         Handoff Manager Install Complete         ║
║                                                  ║
╚══════════════════════════════════════════════════╝

The Handoff Manager (v${config.version}) has been installed to \${targetDir}

Files installed:
- Custom mode in .roomodes
- Handoff rules in .clinerules
- System prompt (if applicable)
\${CONFIG.directories.map(dir => \`- \${dir.target}\`).join('\\n')}
\${Object.keys(backupPaths).length > 0 ? \`
Backup created:\` : ''}
\${Object.entries(backupPaths).map(([dir, path]) => \`- Previous \${dir} preserved in \${path}\`).join('\\n')}

Next Steps:
\${CONFIG.nextSteps.map(step => \`\${step}\`).join('\\n')}

For documentation, see:
\${CONFIG.documentation.map(doc => \`- \${doc}\`).join('\\n')}\`);
    
    return true;
  } catch (error) {
    console.error('Error during installation:', error);
    return false;
  }
}

// Execute the installation
installHandoffManager();
`;
    
    // Write to all output files
    for (const outputFile of outputFiles) {
      // Ensure directory exists
      ensureDirectoryForFile(outputFile);
      
      // Write the output file
      fs.writeFileSync(outputFile, outputContent);
      console.log(`- Published to: ${outputFile}`);
      
      // Make the file executable on Unix-like systems
      if (config.installOptions.executable) {
        try {
          fs.chmodSync(outputFile, '755');
        } catch (err) {
          // Ignore permission errors on Windows
        }
      }
    }
    
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║        Standalone Installer Published            ║
║                                                  ║
╚══════════════════════════════════════════════════╝

Standalone installer created at:
${outputFiles.map(file => `- ${file}`).join('\n')}

This file contains everything needed to install the Handoff Manager v${config.version}. 
Users can run it directly:

node handoff-manager-installer.js [target-directory]

All files will be extracted and installed automatically with proper backups of existing content.
`);
    
    return true;
  } catch (error) {
    console.error(`Error generating standalone installer: ${error.message}`);
    return false;
  }
}

// Execute the publication
generateStandaloneInstaller();