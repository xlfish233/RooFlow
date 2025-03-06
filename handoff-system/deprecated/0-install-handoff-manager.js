/**
 * Handoff Manager Installation Script
 * 
 * This script helps users install the Handoff Manager in their workspace.
 * It preserves existing configurations while adding the handoff-manager functionality.
 * It also backs up existing directories to avoid overwriting user customizations.
 * 
 * Usage:
 *   node install-handoff-manager.js [target-directory]
 * 
 * If target-directory is not specified, it uses the current directory.
 */

const fs = require('fs');
const path = require('path');

// Get the script directory path
const scriptDir = __dirname;
// Get handoff-manager directory (one level up from scripts directory)
const handoffManagerDir = path.resolve(scriptDir, '..');
// Get target directory (either specified by user or current directory)
const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║            Handoff Manager Installer             ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);

console.log(`Installing Handoff Manager to: ${targetDir}`);

// Create directories if they don't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`- Created directory: ${dirPath}`);
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
  let backupPath = `${dirPath}-backup`;
  
  // Check if the backup name already exists
  if (fs.existsSync(backupPath)) {
    // Find the next available numbered backup
    let counter = 1;
    while (fs.existsSync(`${backupPath}-${counter}`)) {
      counter++;
    }
    backupPath = `${backupPath}-${counter}`;
  }
  
  try {
    // Rename the directory to the backup path
    fs.renameSync(dirPath, backupPath);
    console.log(`- Backed up existing directory: ${dirPath} → ${backupPath}`);
    return backupPath;
  } catch (err) {
    console.error(`- Error backing up directory ${dirPath}: ${err.message}`);
    return null;
  }
}

// Helper function to recursively copy a directory
function copyDir(src, dest, excludeFiles = []) {
  ensureDir(dest);
  
  try {
    let entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
      let srcPath = path.join(src, entry.name);
      let destPath = path.join(dest, entry.name);
      
      // Skip excluded files
      if (excludeFiles.includes(entry.name)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath, excludeFiles);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`- Copied: ${entry.name}`);
      }
    }
  } catch (err) {
    console.error(`- Error copying directory: ${err.message}`);
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
    console.error(`- Error merging .roomodes files: ${err.message}`);
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
        if (!mergedContent.endsWith('\n\n')) {
          if (mergedContent.endsWith('\n')) {
            mergedContent += '\n';
          } else {
            mergedContent += '\n\n';
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
    console.error(`- Error merging .clinerules files: ${err.message}`);
    return false;
  }
}

// Main installation function
async function installHandoffManager() {
  try {
    console.log('\nChecking environment...');
    
    // Verify handoff-manager directory exists
    const sourceRoomodesPath = path.join(handoffManagerDir, '.roomodes');
    if (!fs.existsSync(sourceRoomodesPath)) {
      console.error(`- Error: Handoff Manager files not found at ${handoffManagerDir}`);
      console.error('  Make sure you are running this script from the correct location.');
      return false;
    }
    
    // Install system prompt if needed
    const sourceSystemPrompt = path.join(handoffManagerDir, 'system-prompt-handoff-manager');
    const targetSystemPrompt = path.join(targetDir, 'system-prompt-handoff-manager');
    
    // Backup existing system prompt if it exists
    if (fs.existsSync(targetSystemPrompt)) {
      const backupFile = `${targetSystemPrompt}.bak`;
      fs.copyFileSync(targetSystemPrompt, backupFile);
      console.log(`- Backed up existing system prompt to ${backupFile}`);
    }
    
    if (fs.existsSync(sourceSystemPrompt)) {
      fs.copyFileSync(sourceSystemPrompt, targetSystemPrompt);
      console.log('- Installed system-prompt-handoff-manager');
    } else {
      console.warn('- Warning: system-prompt-handoff-manager not found, skipping');
    }
    
    // Merge .roomodes files
    const existingRoomodesPath = path.join(targetDir, '.roomodes');
    const targetRoomodesPath = path.join(targetDir, '.roomodes');
    
    console.log('\nConfiguring custom modes...');
    mergeRoomodes(existingRoomodesPath, sourceRoomodesPath, targetRoomodesPath);
    
    // Merge .clinerules files
    const existingClinerules = path.join(targetDir, '.clinerules');
    const sourceClinerules = path.join(handoffManagerDir, '.clinerules');
    const targetClinerules = path.join(targetDir, '.clinerules');
    
    console.log('\nConfiguring handoff rules...');
    mergeClinerules(existingClinerules, sourceClinerules, targetClinerules);
    
    // Create handoffs directory if it doesn't exist
    const targetHandoffsDir = path.join(targetDir, 'handoffs');
    const isNewHandoffsDir = ensureDir(targetHandoffsDir);
    
    // Back up and install 0-instructions directory
    console.log('\nInstalling handoff instructions...');
    const sourceInstructionsDir = path.join(handoffManagerDir, 'handoffs', '0-instructions');
    const targetInstructionsDir = path.join(targetHandoffsDir, '0-instructions');
    
    // Backup existing 0-instructions directory
    const instructionsBackupPath = backupDirectory(targetInstructionsDir);
    
    if (fs.existsSync(sourceInstructionsDir)) {
      copyDir(sourceInstructionsDir, targetInstructionsDir);
      if (instructionsBackupPath) {
        console.log(`- Note: Previous instructions backed up to ${path.basename(instructionsBackupPath)}`);
      }
    } else {
      console.error('- Error: Handoff instructions not found');
    }
    
    // Handle scripts directory
    console.log('\nInstalling handoff scripts...');
    const sourceScriptsDir = path.join(handoffManagerDir, 'handoffs', 'scripts');
    const targetScriptsDir = path.join(targetHandoffsDir, 'scripts');
    
    // Backup existing scripts directory
    const scriptsBackupPath = backupDirectory(targetScriptsDir);
    
    if (fs.existsSync(sourceScriptsDir)) {
      copyDir(sourceScriptsDir, targetScriptsDir);
      if (scriptsBackupPath) {
        console.log(`- Note: Previous scripts backed up to ${path.basename(scriptsBackupPath)}`);
      }
    } else {
      console.error('- Error: Handoff scripts not found');
    }
    
    // Display success message and next steps
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║         Handoff Manager Install Complete         ║
║                                                  ║
╚══════════════════════════════════════════════════╝

The Handoff Manager has been installed to ${targetDir}

Files installed:
- Custom mode in .roomodes
- Handoff rules in .clinerules
- System prompt (if applicable)
- Handoff instructions in handoffs/0-instructions/
- Handoff scripts in handoffs/scripts/
${instructionsBackupPath ? `
Backup created:
- Previous instructions preserved in ${instructionsBackupPath}` : ''}
${scriptsBackupPath ? `- Previous scripts preserved in ${scriptsBackupPath}` : ''}

Next Steps:
1. Switch to handoff-manager mode in Roo-Code
2. Create your first handoff:
   I need to create a handoff document for our current work. Please follow the handoff creation workflow.

For documentation, see:
- handoffs/0-instructions/0-intro.md
- handoffs/0-instructions/1-handoff-instructions.md
- handoffs/0-instructions/2-milestone-instructions.md`);
    
    return true;
  } catch (error) {
    console.error('Error during installation:', error);
    return false;
  }
}

// Execute the installation
installHandoffManager();