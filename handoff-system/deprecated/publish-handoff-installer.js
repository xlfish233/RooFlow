#!/usr/bin/env node
/**
 * Handoff Manager Installer Publisher
 * 
 * This script generates a standalone installer for the handoff manager system.
 * It follows a configuration-driven approach where:
 * 1. The publish-config.json specifies which files to include
 * 2. The system-prompt-config.json defines how to assemble the system prompt
 * 
 * This allows evolution of the handoff system without modifying this script.
 */

const fs = require('fs');
const path = require('path');

// Get the script directory path
const scriptDir = __dirname;

// Configuration paths
const publishConfigPath = path.join(scriptDir, 'publish-config.json');

console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║        Handoff Manager Installer Publisher       ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);

// Load publish configuration
let publishConfig;
try {
  const configContent = fs.readFileSync(publishConfigPath, 'utf8');
  publishConfig = JSON.parse(configContent);
  console.log(`Loaded publish configuration from ${publishConfigPath}`);
} catch (err) {
  console.error(`Error loading publish configuration: ${err.message}`);
  process.exit(1);
}

// Load system prompt configuration
const componentsPath = path.join(scriptDir, publishConfig.components.sourcePath);
const promptConfigPath = path.join(componentsPath, publishConfig.components.configFile);
let promptConfig;
try {
  const promptConfigContent = fs.readFileSync(promptConfigPath, 'utf8');
  promptConfig = JSON.parse(promptConfigContent);
  console.log(`Loaded system prompt configuration from ${promptConfigPath}`);
} catch (err) {
  console.error(`Error loading system prompt configuration: ${err.message}`);
  process.exit(1);
}

// Source and output paths
const sourceDir = path.resolve(scriptDir, publishConfig.sourceDir);
const outputFile = process.argv[2] || path.resolve(scriptDir, publishConfig.outputFile);

console.log(`Source directory: ${sourceDir}`);
console.log(`Output file: ${outputFile}`);

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
 * Read a file and encode it as Base64
 * @param {string} filePath - Path to the file
 * @returns {string} - Base64 representation of file content
 */
function encodeFileToBase64(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    // Convert to Base64
    return Buffer.from(content, 'utf8').toString('base64');
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
        // Skip files that are too large
        const stats = fs.statSync(fullPath);
        if (stats.size > publishConfig.maxFileSize) {
          console.log(`- Skipping file (too large): ${relativePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
          continue;
        }
        
        result[relativePath] = encodeFileToBase64(fullPath);
      }
    }
    
    return result;
  } catch (err) {
    console.error(`Error collecting files from ${dir}: ${err.message}`);
    return result;
  }
}

/**
 * Assemble system prompt from components
 * @returns {string} The assembled system prompt
 */
function assembleSystemPrompt() {
  console.log('\n3. Assembling system prompt from components...');
  
  try {
    let content = '';
    
    // Process each component in order
    for (const component of promptConfig.components) {
      if (component.file) {
        // This is a file component
        const componentPath = path.join(componentsPath, component.file);
        if (fs.existsSync(componentPath)) {
          const componentContent = fs.readFileSync(componentPath, 'utf8');
          content += componentContent;
          console.log(`- Added component: ${component.file}`);
        } else {
          const errorMsg = `Component file not found: ${component.file}`;
          if (promptConfig.errorHandling.missingFile === "error" && 
              !promptConfig.errorHandling.continueOnError) {
            throw new Error(errorMsg);
          } else {
            console.error(`- Warning: ${errorMsg}`);
          }
        }
      } else if (component.special === "toolEssentials") {
        // This is the special tool essentials section
        content += component.content;
        console.log('- Added special component: toolEssentials');
      }
    }
    
    // Do not write to file - just return the content
    console.log(`- System prompt assembled from components`);
    
    return content;
  } catch (err) {
    console.error(`- Error assembling system prompt: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Process root files specified in config
 * @param {string} systemPrompt - The assembled system prompt
 * @returns {Object} Collected root files
 */
function processRootFiles(systemPrompt) {
  console.log('\n4. Processing root files...');
  const fileContents = {};
  
  // Add the assembled system prompt as a virtual file
  fileContents['system-prompt-handoff-manager'] = Buffer.from(systemPrompt, 'utf8').toString('base64');
  console.log(`- Added dynamically assembled system prompt`);
  
  for (const rootFile of publishConfig.rootFiles) {
    const filePath = path.join(sourceDir, rootFile);
    if (fs.existsSync(filePath)) {
      fileContents[path.basename(rootFile)] = encodeFileToBase64(filePath);
      console.log(`- Processed: ${rootFile}`);
    } else {
      console.warn(`- Warning: Root file not found: ${rootFile}`);
    }
  }
  
  return fileContents;
}

/**
 * Process directories specified in config
 * @returns {Object} Collected directory files
 */
function processDirectories() {
  console.log('\n5-6. Processing directories...');
  const fileContents = {};
  
  for (const directory of publishConfig.directories) {
    const dirPath = path.join(sourceDir, directory.source);
    if (fs.existsSync(dirPath)) {
      const files = collectFiles(dirPath, sourceDir);
      
      // Map the collected files to their target paths
      Object.entries(files).forEach(([srcPath, content]) => {
        // Replace the source directory prefix with the target directory prefix
        const targetPath = srcPath.replace(
          new RegExp(`^${directory.source.replace(/\\/g, '/')}`, 'i'), 
          directory.target
        );
        fileContents[targetPath] = content;
      });
      
      console.log(`- Processed directory: ${directory.source} -> ${directory.target}`);
    } else {
      console.warn(`- Warning: Directory not found: ${directory.source}`);
    }
  }
  
  return fileContents;
}

/**
 * Handle files and directories that need to be backed up
 * @param {string} targetDir - Target installation directory
 * @returns {Object} - Map of paths to their backup locations
 */
function backupExistingInstallation(targetDir) {
  console.log('\nChecking for existing handoff system installation...');
  const backupPaths = {};
  
  // Check if handoffs directory exists - this is the main indicator of an existing installation
  const handoffsDir = path.join(targetDir, 'handoffs');
  if (fs.existsSync(handoffsDir)) {
    console.log('- Existing handoff system detected');
    
    // Backup the entire handoffs directory
    const handoffsBackupDir = `${handoffsDir}-backup`;
    let backupSuffix = '';
    let counter = 1;
    
    // Find available backup name
    while (fs.existsSync(`${handoffsBackupDir}${backupSuffix}`)) {
      backupSuffix = `-${counter}`;
      counter++;
    }
    
    const finalBackupPath = `${handoffsBackupDir}${backupSuffix}`;
    
    try {
      // Create backup directory
      fs.mkdirSync(finalBackupPath, { recursive: true });
      console.log(`- Created backup directory: ${finalBackupPath}`);
      
      // Copy all existing files to backup instead of renaming
      // This preserves the original in case of installation failure
      const copyDirRecursive = (src, dest) => {
        // Create destination directory
        fs.mkdirSync(dest, { recursive: true });
        
        // Read directory contents
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            // Recursive call for directories
            copyDirRecursive(srcPath, destPath);
          } else {
            // Copy file
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      // Copy all files from handoffs to backup
      copyDirRecursive(handoffsDir, finalBackupPath);
      console.log(`- Backed up handoffs directory to ${finalBackupPath}`);
      backupPaths['handoffs'] = finalBackupPath;
    } catch (err) {
      console.error(`- Error backing up handoffs directory: ${err.message}`);
    }
  } else {
    console.log('- No existing handoff system detected');
  }
  
  return backupPaths;
}

// Function to merge custom modes from two .roomodes files
function mergeRoomodes(existingPath, newPath, outputPath) {
  try {
    // Read existing .roomodes if it exists
    let mergedContent = { customModes: [] };
    let existingContentStr = '';
    
    if (fs.existsSync(existingPath)) {
      console.log('- Found existing .roomodes file, checking content');
      existingContentStr = fs.readFileSync(existingPath, 'utf8');
      
      try {
        const existingContent = JSON.parse(existingContentStr);
        
        // Check if the file already has the handoff-manager mode
        if (existingContent.customModes && Array.isArray(existingContent.customModes)) {
          const hasHandoffManager = existingContent.customModes.some(mode => mode.slug === 'handoff-manager');
          
          if (hasHandoffManager) {
            console.log('- Handoff manager mode already exists in .roomodes, preserving existing file');
            // If the file already has the handoff-manager mode, don't modify it
            return true;
          }
          
          // Otherwise, keep all existing modes
          mergedContent.customModes = [...existingContent.customModes];
          console.log(`- Preserved ${mergedContent.customModes.length} existing custom modes`);
        } else {
          console.log('- Existing .roomodes has invalid format, will create proper structure');
        }
      } catch (parseErr) {
        console.error(`- Error parsing existing .roomodes file: ${parseErr.message}`);
        console.log('- Will create proper JSON structure while preserving any existing content');
      }
    } else {
      console.log('- No existing .roomodes file found, creating new one');
    }
    
    // Read new .roomodes to get the handoff-manager mode
    if (fs.existsSync(newPath)) {
      try {
        const newContent = JSON.parse(fs.readFileSync(newPath, 'utf8'));
        
        // Add handoff-manager mode if it exists in the new file
        if (newContent.customModes && Array.isArray(newContent.customModes)) {
          const handoffManagerMode = newContent.customModes.find(
            mode => mode.slug === 'handoff-manager'
          );
          
          if (handoffManagerMode) {
            // Check if we already have this exact mode
            const alreadyHasExactMode = mergedContent.customModes.some(
              mode => JSON.stringify(mode) === JSON.stringify(handoffManagerMode)
            );
            
            if (!alreadyHasExactMode) {
              // Remove any existing handoff-manager mode before adding the new one
              mergedContent.customModes = mergedContent.customModes.filter(
                mode => mode.slug !== 'handoff-manager'
              );
              
              // Add the new handoff-manager mode
              mergedContent.customModes.push(handoffManagerMode);
              console.log('- Added handoff-manager mode to configuration');
            } else {
              console.log('- Identical handoff-manager mode already exists, no changes needed');
            }
          } else {
            console.warn('- Warning: handoff-manager mode not found in new .roomodes file');
          }
        }
      } catch (err) {
        console.error(`- Error reading new .roomodes file: ${err.message}`);
        return false;
      }
    }
    
    // Only write if we've made changes
    const newContentStr = JSON.stringify(mergedContent, null, 2);
    if (existingContentStr !== newContentStr && mergedContent.customModes.length > 0) {
      fs.writeFileSync(outputPath, newContentStr);
      console.log('- Successfully updated .roomodes file with merged content');
    } else if (existingContentStr === newContentStr) {
      console.log('- No changes needed to .roomodes file');
    } else {
      console.warn('- Warning: No custom modes to write, keeping existing file');
    }
    
    return true;
  } catch (err) {
    console.error(`- Error merging .roomodes files: ${err.message}`);
    return false;
  }
}

// Function to merge .clinerules files
function mergeClinerules(existingPath, newPath, outputPath) {
  try {
    let mergedContent = '';
    let existingContent = '';
    
    // Read existing .clinerules if it exists
    if (fs.existsSync(existingPath)) {
      console.log('- Found existing .clinerules file');
      existingContent = fs.readFileSync(existingPath, 'utf8');
      
      // Check if handoff system rules already exist
      if (existingContent.includes('Handoff System Rules')) {
        console.log('- Handoff System Rules already exist in .clinerules, preserving existing content');
        return true; // No changes needed
      }
      
      // If we get here, we need to append the new rules
      console.log('- No existing Handoff System Rules found, appending new rules');
      mergedContent = existingContent;
      
      // Add blank line if needed
      if (!mergedContent.endsWith('\n\n')) {
        if (mergedContent.endsWith('\n')) {
          mergedContent += '\n';
        } else {
          mergedContent += '\n\n';
        }
      }
    } else {
      console.log('- No existing .clinerules file found, creating new one');
    }
    
    // Add new rules
    if (fs.existsSync(newPath)) {
      const newContent = fs.readFileSync(newPath, 'utf8');
      
      // Check if the new content is already included in the existing content
      if (existingContent.includes(newContent.trim())) {
        console.log('- Content already exists in .clinerules, no changes needed');
        return true;
      }
      
      console.log('- Adding Handoff System Rules to .clinerules');
      mergedContent += newContent;
    } else {
      console.warn('- Warning: New .clinerules file not found');
      return false;
    }
    
    // Only write if we've made changes
    if (mergedContent !== existingContent) {
      fs.writeFileSync(outputPath, mergedContent);
      console.log('- Successfully updated .clinerules file');
    } else {
      console.log('- No changes needed to .clinerules file');
    }
    
    return true;
  } catch (err) {
    console.error(`- Error merging .clinerules files: ${err.message}`);
    return false;
  }
}

// Function to write all files from the FILES object
function writeAllFiles(targetDir) {
  console.log('\nWriting files...');
  
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
      console.log(`- Created: ${filePath}`);
    } catch (err) {
      console.error(`- Error writing file ${filePath}: ${err.message}`);
    }
  }
}

// Main installation function
async function installHandoffManager() {
  try {
    // First backup any existing handoff system
    const backupPaths = CONFIG.installOptions.createBackups ?
      backupExistingInstallation(targetDir) : {};
    
    // Write all files to the target directory
    writeAllFiles(targetDir);
    
    // Create handoffs directory if it doesn't exist
    const targetHandoffsDir = path.join(targetDir, 'handoffs');
    ensureDir(targetHandoffsDir);
    
    // Merge configuration files if needed
    if (CONFIG.installOptions.mergeRoomodes) {
      console.log('\nConfiguring custom modes...');
      
      // Get paths for .roomodes files
      const existingRoomodesPath = path.join(targetDir, '.roomodes');
      const newRoomodesPath = path.join(targetDir, '.roomodes');
      const tempRoomodesPath = path.join(targetDir, '.roomodes.temp');
      
      // Create a backup of the existing .roomodes file if it exists
      if (fs.existsSync(existingRoomodesPath)) {
        try {
          // Copy the existing file to a temporary location
          fs.copyFileSync(existingRoomodesPath, tempRoomodesPath);
          console.log('- Created temporary backup of existing .roomodes file');
          
          // Now merge the existing and new content
          const success = mergeRoomodes(existingRoomodesPath, newRoomodesPath, newRoomodesPath);
          
          // Clean up the temporary file
          if (fs.existsSync(tempRoomodesPath)) {
            fs.unlinkSync(tempRoomodesPath);
          }
          
          if (success) {
            console.log('- Custom modes configuration complete');
          }
        } catch (err) {
          console.error(`- Error during .roomodes merging: ${err.message}`);
          
          // Restore from backup if available
          if (fs.existsSync(tempRoomodesPath)) {
            try {
              fs.copyFileSync(tempRoomodesPath, existingRoomodesPath);
              console.log('- Restored .roomodes from backup after error');
              fs.unlinkSync(tempRoomodesPath);
            } catch (restoreErr) {
              console.error(`- Error restoring .roomodes backup: ${restoreErr.message}`);
            }
          }
        }
      } else {
        console.log('- No existing .roomodes file found, creating new one');
        // Just write the new file directly
        if (fs.existsSync(newRoomodesPath)) {
          mergeRoomodes(null, newRoomodesPath, newRoomodesPath);
        }
      }
    }
    
    if (CONFIG.installOptions.mergeClinerules) {
      console.log('\nConfiguring handoff rules...');
      
      // Get paths for .clinerules files
      const existingClinerules = path.join(targetDir, '.clinerules');
      const newClinerules = path.join(targetDir, '.clinerules');
      const tempClinerules = path.join(targetDir, '.clinerules.temp');
      
      // Create a backup of the existing .clinerules file if it exists
      if (fs.existsSync(existingClinerules)) {
        try {
          // Copy the existing file to a temporary location
          fs.copyFileSync(existingClinerules, tempClinerules);
          console.log('- Created temporary backup of existing .clinerules file');
          
          // Now merge the existing and new content
          const success = mergeClinerules(existingClinerules, newClinerules, newClinerules);
          
          // Clean up the temporary file
          if (fs.existsSync(tempClinerules)) {
            fs.unlinkSync(tempClinerules);
          }
          
          if (success) {
            console.log('- Handoff rules configuration complete');
          }
        } catch (err) {
          console.error(`- Error during .clinerules merging: ${err.message}`);
          
          // Restore from backup if available
          if (fs.existsSync(tempClinerules)) {
            try {
              fs.copyFileSync(tempClinerules, existingClinerules);
              console.log('- Restored .clinerules from backup after error');
              fs.unlinkSync(tempClinerules);
            } catch (restoreErr) {
              console.error(`- Error restoring .clinerules backup: ${restoreErr.message}`);
            }
          }
        }
      } else {
        console.log('- No existing .clinerules file found, creating new one');
        // Just write the new file directly
        if (fs.existsSync(newClinerules)) {
          mergeClinerules(null, newClinerules, newClinerules);
        }
      }
    }
    
    // Display success message and next steps
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║         Handoff Manager Install Complete         ║
║                                                  ║
╚══════════════════════════════════════════════════╝

The Handoff Manager (v${publishConfig.version}) has been installed to ${targetDir}

Files installed:
- Custom mode in .roomodes
- Handoff rules in .clinerules
- System prompt (if applicable)
${CONFIG.directories.map(dir => `- ${dir.target}`).join('\n')}
${Object.keys(backupPaths).length > 0 ? `
Backup created:` : ''}
${Object.entries(backupPaths).map(([dir, path]) => `- Previous ${dir} preserved in ${path}`).join('\n')}

Next Steps:
${CONFIG.nextSteps.map(step => `${step}`).join('\n')}

For documentation, see:
${CONFIG.documentation.map(doc => `- ${doc}`).join('\n')}`);
    
    return true;
  } catch (error) {
    console.error('Error during installation:', error);
    return false;
  }
}

// Execute the installation
installHandoffManager();`;

/**
 * Generate the installer script
 * @param {Object} fileContents - Collection of all files to embed
 */
function generateInstaller(fileContents) {
  console.log('\n7. Generating installer script...');
  
  // Build the output file content
  const outputContent = `#!/usr/bin/env node
/**
 * Handoff Manager Standalone Installer (v${publishConfig.version})
 *
 * This is a self-contained script that installs the complete Handoff Manager system.
 * It includes all necessary files and will create the proper directory structure.
 *
 * Generated by publish-handoff-installer.js
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

console.log(\`Installing Handoff Manager v${publishConfig.version} to: \${targetDir}\`);

// Files to be created (stored as normalized paths with base64 encoded content)
const BASE64_FILES = {
${Object.entries(fileContents)
  .map(([filePath, content]) => `  "${filePath}": "${content}"`)
  .join(',\n')}
};

// Helper function to decode base64 content
function decodeBase64(base64Content) {
  return Buffer.from(base64Content, 'base64').toString('utf8');
}

// Files object with decoded content (for internal use)
const FILES = Object.fromEntries(
  Object.entries(BASE64_FILES).map(([path, content]) => [path, decodeBase64(content)])
);

// Configuration for installation
const CONFIG = ${JSON.stringify({
  directories: publishConfig.directories,
  installOptions: publishConfig.installOptions,
  nextSteps: publishConfig.nextSteps,
  documentation: publishConfig.documentation
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

/**
 * Handle files and directories that need to be backed up
 * @param {string} targetDir - Target installation directory
 * @returns {Object} - Map of paths to their backup locations
 */
function backupExistingInstallation(targetDir) {
  console.log('\\nChecking for existing handoff system installation...');
  const backupPaths = {};
  
  // Check if handoffs directory exists - this is the main indicator of an existing installation
  const handoffsDir = path.join(targetDir, 'handoffs');
  if (fs.existsSync(handoffsDir)) {
    console.log('- Existing handoff system detected');
    
    // Backup the entire handoffs directory
    const handoffsBackupDir = \`\${handoffsDir}-backup\`;
    let backupSuffix = '';
    let counter = 1;
    
    // Find available backup name
    while (fs.existsSync(\`\${handoffsBackupDir}\${backupSuffix}\`)) {
      backupSuffix = \`-\${counter}\`;
      counter++;
    }
    
    const finalBackupPath = \`\${handoffsBackupDir}\${backupSuffix}\`;
    
    try {
      // Create backup directory
      fs.mkdirSync(finalBackupPath, { recursive: true });
      console.log(\`- Created backup directory: \${finalBackupPath}\`);
      
      // Copy all existing files to backup instead of renaming
      // This preserves the original in case of installation failure
      const copyDirRecursive = (src, dest) => {
        // Create destination directory
        fs.mkdirSync(dest, { recursive: true });
        
        // Read directory contents
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            // Recursive call for directories
            copyDirRecursive(srcPath, destPath);
          } else {
            // Copy file
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      // Copy all files from handoffs to backup
      copyDirRecursive(handoffsDir, finalBackupPath);
      console.log(\`- Backed up handoffs directory to \${finalBackupPath}\`);
      backupPaths['handoffs'] = finalBackupPath;
    } catch (err) {
      console.error(\`- Error backing up handoffs directory: \${err.message}\`);
    }
  } else {
    console.log('- No existing handoff system detected');
  }
  
  return backupPaths;
}

// Function to merge custom modes from two .roomodes files
function mergeRoomodes(existingPath, newPath, outputPath) {
  try {
    // Read existing .roomodes if it exists
    let mergedContent = { customModes: [] };
    let existingContentStr = '';
    
    if (fs.existsSync(existingPath)) {
      console.log('- Found existing .roomodes file, checking content');
      existingContentStr = fs.readFileSync(existingPath, 'utf8');
      
      try {
        const existingContent = JSON.parse(existingContentStr);
        
        // Check if the file already has the handoff-manager mode
        if (existingContent.customModes && Array.isArray(existingContent.customModes)) {
          const hasHandoffManager = existingContent.customModes.some(mode => mode.slug === 'handoff-manager');
          
          if (hasHandoffManager) {
            console.log('- Handoff manager mode already exists in .roomodes, preserving existing file');
            // If the file already has the handoff-manager mode, don't modify it
            return true;
          }
          
          // Otherwise, keep all existing modes
          mergedContent.customModes = [...existingContent.customModes];
          console.log(\`- Preserved \${mergedContent.customModes.length} existing custom modes\`);
        } else {
          console.log('- Existing .roomodes has invalid format, will create proper structure');
        }
      } catch (parseErr) {
        console.error(\`- Error parsing existing .roomodes file: \${parseErr.message}\`);
        console.log('- Will create proper JSON structure while preserving any existing content');
      }
    } else {
      console.log('- No existing .roomodes file found, creating new one');
    }
    
    // Read new .roomodes to get the handoff-manager mode
    if (fs.existsSync(newPath)) {
      try {
        const newContent = JSON.parse(fs.readFileSync(newPath, 'utf8'));
        
        // Add handoff-manager mode if it exists in the new file
        if (newContent.customModes && Array.isArray(newContent.customModes)) {
          const handoffManagerMode = newContent.customModes.find(
            mode => mode.slug === 'handoff-manager'
          );
          
          if (handoffManagerMode) {
            // Check if we already have this exact mode
            const alreadyHasExactMode = mergedContent.customModes.some(
              mode => JSON.stringify(mode) === JSON.stringify(handoffManagerMode)
            );
            
            if (!alreadyHasExactMode) {
              // Remove any existing handoff-manager mode before adding the new one
              mergedContent.customModes = mergedContent.customModes.filter(
                mode => mode.slug !== 'handoff-manager'
              );
              
              // Add the new handoff-manager mode
              mergedContent.customModes.push(handoffManagerMode);
              console.log('- Added handoff-manager mode to configuration');
            } else {
              console.log('- Identical handoff-manager mode already exists, no changes needed');
            }
          } else {
            console.warn('- Warning: handoff-manager mode not found in new .roomodes file');
          }
        }
      } catch (err) {
        console.error(\`- Error reading new .roomodes file: \${err.message}\`);
        return false;
      }
    }
    
    // Only write if we've made changes
    const newContentStr = JSON.stringify(mergedContent, null, 2);
    if (existingContentStr !== newContentStr && mergedContent.customModes.length > 0) {
      fs.writeFileSync(outputPath, newContentStr);
      console.log('- Successfully updated .roomodes file with merged content');
    } else if (existingContentStr === newContentStr) {
      console.log('- No changes needed to .roomodes file');
    } else {
      console.warn('- Warning: No custom modes to write, keeping existing file');
    }
    
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
    let existingContent = '';
    
    // Read existing .clinerules if it exists
    if (fs.existsSync(existingPath)) {
      console.log('- Found existing .clinerules file');
      existingContent = fs.readFileSync(existingPath, 'utf8');
      
      // Check if handoff system rules already exist
      if (existingContent.includes('Handoff System Rules')) {
        console.log('- Handoff System Rules already exist in .clinerules, preserving existing content');
        return true; // No changes needed
      }
      
      // If we get here, we need to append the new rules
      console.log('- No existing Handoff System Rules found, appending new rules');
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
      console.log('- No existing .clinerules file found, creating new one');
    }
    
    // Add new rules
    if (fs.existsSync(newPath)) {
      const newContent = fs.readFileSync(newPath, 'utf8');
      
      // Check if the new content is already included in the existing content
      if (existingContent.includes(newContent.trim())) {
        console.log('- Content already exists in .clinerules, no changes needed');
        return true;
      }
      
      console.log('- Adding Handoff System Rules to .clinerules');
      mergedContent += newContent;
    } else {
      console.warn('- Warning: New .clinerules file not found');
      return false;
    }
    
    // Only write if we've made changes
    if (mergedContent !== existingContent) {
      fs.writeFileSync(outputPath, mergedContent);
      console.log('- Successfully updated .clinerules file');
    } else {
      console.log('- No changes needed to .clinerules file');
    }
    
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
    // First backup any existing handoff system
    const backupPaths = CONFIG.installOptions.createBackups ? 
      backupExistingInstallation(targetDir) : {};
    
    // Write all files to the target directory
    writeAllFiles(targetDir);
    
    // Create handoffs directory if it doesn't exist
    const targetHandoffsDir = path.join(targetDir, 'handoffs');
    ensureDir(targetHandoffsDir);
    
    // Merge configuration files if needed
    if (CONFIG.installOptions.mergeRoomodes) {
      console.log('\\nConfiguring custom modes...');
      
      // Get paths for .roomodes files
      const existingRoomodesPath = path.join(targetDir, '.roomodes');
      const newRoomodesPath = path.join(targetDir, '.roomodes');
      const tempRoomodesPath = path.join(targetDir, '.roomodes.temp');
      
      // Create a backup of the existing .roomodes file if it exists
      if (fs.existsSync(existingRoomodesPath)) {
        try {
          // Copy the existing file to a temporary location
          fs.copyFileSync(existingRoomodesPath, tempRoomodesPath);
          console.log('- Created temporary backup of existing .roomodes file');
          
          // Now merge the existing and new content
          const success = mergeRoomodes(existingRoomodesPath, newRoomodesPath, newRoomodesPath);
          
          // Clean up the temporary file
          if (fs.existsSync(tempRoomodesPath)) {
            fs.unlinkSync(tempRoomodesPath);
          }
          
          if (success) {
            console.log('- Custom modes configuration complete');
          }
        } catch (err) {
          console.error(\`- Error during .roomodes merging: \${err.message}\`);
          
          // Restore from backup if available
          if (fs.existsSync(tempRoomodesPath)) {
            try {
              fs.copyFileSync(tempRoomodesPath, existingRoomodesPath);
              console.log('- Restored .roomodes from backup after error');
              fs.unlinkSync(tempRoomodesPath);
            } catch (restoreErr) {
              console.error(\`- Error restoring .roomodes backup: \${restoreErr.message}\`);
            }
          }
        }
      } else {
        console.log('- No existing .roomodes file found, creating new one');
        // Just write the new file directly
        if (fs.existsSync(newRoomodesPath)) {
          mergeRoomodes(null, newRoomodesPath, newRoomodesPath);
        }
      }
    }
    
    if (CONFIG.installOptions.mergeClinerules) {
      console.log('\\nConfiguring handoff rules...');
      
      // Get paths for .clinerules files
      const existingClinerules = path.join(targetDir, '.clinerules');
      const newClinerules = path.join(targetDir, '.clinerules');
      const tempClinerules = path.join(targetDir, '.clinerules.temp');
      
      // Create a backup of the existing .clinerules file if it exists
      if (fs.existsSync(existingClinerules)) {
        try {
          // Copy the existing file to a temporary location
          fs.copyFileSync(existingClinerules, tempClinerules);
          console.log('- Created temporary backup of existing .clinerules file');
          
          // Now merge the existing and new content
          const success = mergeClinerules(existingClinerules, newClinerules, newClinerules);
          
          // Clean up the temporary file
          if (fs.existsSync(tempClinerules)) {
            fs.unlinkSync(tempClinerules);
          }
          
          if (success) {
            console.log('- Handoff rules configuration complete');
          }
        } catch (err) {
          console.error(\`- Error during .clinerules merging: \${err.message}\`);
          
          // Restore from backup if available
          if (fs.existsSync(tempClinerules)) {
            try {
              fs.copyFileSync(tempClinerules, existingClinerules);
              console.log('- Restored .clinerules from backup after error');
              fs.unlinkSync(tempClinerules);
            } catch (restoreErr) {
              console.error(\`- Error restoring .clinerules backup: \${restoreErr.message}\`);
            }
          }
        }
      } else {
        console.log('- No existing .clinerules file found, creating new one');
        // Just write the new file directly
        if (fs.existsSync(newClinerules)) {
          mergeClinerules(null, newClinerules, newClinerules);
        }
      }
    }
    
    // Display success message and next steps
    console.log(\`
╔══════════════════════════════════════════════════╗
║                                                  ║
║         Handoff Manager Install Complete         ║
║                                                  ║
╚══════════════════════════════════════════════════╝

The Handoff Manager (v${publishConfig.version}) has been installed to \${targetDir}

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
installHandoffManager();`;

  // Ensure the output directory exists
  ensureDirectoryForFile(outputFile);
  
  // Write the installer script
  fs.writeFileSync(outputFile, outputContent);
  console.log(`- Installer generated: ${outputFile}`);
  
  // Make the file executable on Unix-like systems
  if (publishConfig.installOptions.executable) {
    try {
      fs.chmodSync(outputFile, '755');
      console.log('- Made installer executable');
    } catch (err) {
      // Ignore permission errors on Windows
    }
  }
}

/**
 * Main function to generate the installer
 */
function main() {
  try {
    // Step 1-2: Configuration is loaded at the beginning
    
    // Step 3: Assemble system prompt
    const systemPrompt = assembleSystemPrompt();
    
    // Step 4: Process root files
    const rootFiles = processRootFiles(systemPrompt);
    
    // Step 5-6: Process directories
    const directoryFiles = processDirectories();
    
    // Combine all files
    const allFiles = { ...rootFiles, ...directoryFiles };
    console.log(`- Total files collected: ${Object.keys(allFiles).length}`);
    // Step 7: Generate installer
    generateInstaller(allFiles);
    
    // Copy the readme file to the output directory with the same name
    const readmeSource = path.join(sourceDir, 'handoff-installer-readme.md');
    const readmeTarget = path.join(path.dirname(outputFile), 'handoff-installer-readme.md');
    if (fs.existsSync(readmeSource)) {
      fs.copyFileSync(readmeSource, readmeTarget);
      console.log(`- Copied readme to: ${readmeTarget}`);
    } else {
      console.warn('- Warning: Could not find handoff-installer-readme.md to copy');
    }
    
    // Step 8: Display success message
    // Step 8: Display success message
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║        Handoff Installer Creation Complete       ║
║                                                  ║
╚══════════════════════════════════════════════════╝

Standalone installer created at:
- ${outputFile}

This file contains everything needed to install the Handoff Manager v${publishConfig.version}. 
Users can run it directly:

node ${path.basename(outputFile)} [target-directory]

All files will be extracted and installed automatically with proper backups of existing content.
`);
    
  } catch (error) {
    console.error(`Error generating installer: ${error.message}`);
    process.exit(1);
  }
}

// Execute the main function
main();