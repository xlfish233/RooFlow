/**
 * Handoff Manager System Publisher
 * 
 * This script copies the necessary handoff-manager files to the handoff-manager directory.
 * It doesn't generate any content - it simply copies existing files to the right locations.
 */

const fs = require('fs');
const path = require('path');

// Get the script directory path
const scriptDir = __dirname;
// Get project root directory
const projectRoot = path.resolve(scriptDir, '..');
// Set publish directory
const publishDir = path.join(projectRoot, 'handoff-manager');

console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║          Handoff Manager Publisher               ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);

console.log(`Publishing from: ${scriptDir}`);
console.log(`Publishing to: ${publishDir}`);

// Create directories if they don't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`- Created directory: ${dirPath}`);
  }
}

// Helper function to recursively copy a directory
function copyDir(src, dest) {
  ensureDir(dest);
  
  try {
    let entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
      let srcPath = path.join(src, entry.name);
      let destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    console.log(`- Copied directory: ${src} -> ${dest}`);
  } catch (err) {
    console.error(`- Error copying directory: ${err.message}`);
  }
}

// Main function to publish handoff manager
function publishHandoffManager() {
  try {
    // Ensure publish directory exists
    ensureDir(publishDir);
    
    // Copy config files
    console.log('\nCopying configuration files...');
    
    // .roomodes file
    const sourceModes = path.join(scriptDir, '.roomodes');
    const targetModes = path.join(publishDir, '.roomodes');
    
    if (fs.existsSync(sourceModes)) {
      fs.copyFileSync(sourceModes, targetModes);
      console.log(`- Copied: .roomodes`);
    } else {
      console.error(`- Error: .roomodes not found at ${sourceModes}`);
    }
    
    // .clinerules file
    const sourceRules = path.join(scriptDir, '.clinerules');
    const targetRules = path.join(publishDir, '.clinerules');
    
    if (fs.existsSync(sourceRules)) {
      fs.copyFileSync(sourceRules, targetRules);
      console.log(`- Copied: .clinerules`);
    } else {
      console.error(`- Error: .clinerules not found at ${sourceRules}`);
    }
    
    // system-prompt-handoff-manager file
    const sourcePrompt = path.join(scriptDir, 'system-prompt-handoff-manager');
    const targetPrompt = path.join(publishDir, 'system-prompt-handoff-manager');
    
    if (fs.existsSync(sourcePrompt)) {
      fs.copyFileSync(sourcePrompt, targetPrompt);
      console.log(`- Copied: system-prompt-handoff-manager`);
    } else {
      console.error(`- Error: system-prompt-handoff-manager not found at ${sourcePrompt}`);
    }
    
    // README file
    const sourceReadme = path.join(scriptDir, 'README-REVISED.md');
    const targetReadme = path.join(publishDir, 'README.md');
    
    if (fs.existsSync(sourceReadme)) {
      fs.copyFileSync(sourceReadme, targetReadme);
      console.log(`- Copied: README.md`);
    } else {
      console.error(`- Error: README-REVISED.md not found at ${sourceReadme}`);
    }
    
    // Create handoffs directory
    const targetHandoffsDir = path.join(publishDir, 'handoffs');
    ensureDir(targetHandoffsDir);
    
    // Copy 0-instructions directory
    console.log('\nCopying instruction files...');
    const sourceInstructions = path.join(scriptDir, '0-instructions');
    const targetInstructions = path.join(targetHandoffsDir, '0-instructions');
    
    if (fs.existsSync(sourceInstructions)) {
      copyDir(sourceInstructions, targetInstructions);
    } else {
      console.error(`- Error: 0-instructions directory not found at ${sourceInstructions}`);
    }
    
    // Copy chat_history directory
    console.log('\nCopying conversation extraction tools...');
    const sourceChatHistory = path.join(scriptDir, 'chat_history');
    const targetChatHistory = path.join(targetHandoffsDir, 'chat_history');
    
    if (fs.existsSync(sourceChatHistory)) {
      copyDir(sourceChatHistory, targetChatHistory);
    } else {
      console.error(`- Error: chat_history directory not found at ${sourceChatHistory}`);
    }
    
    // Copy scripts directory
    console.log('\nCopying scripts...');
    const sourceScripts = path.join(scriptDir, 'scripts');
    const targetScripts = path.join(targetHandoffsDir, 'scripts');
    
    if (fs.existsSync(sourceScripts)) {
      copyDir(sourceScripts, targetScripts);
    } else {
      console.error(`- Error: scripts directory not found at ${sourceScripts}`);
    }
    
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║        Publication Successfully Completed        ║
║                                                  ║
╚══════════════════════════════════════════════════╝

Files published to: ${publishDir}

The handoff-manager is now ready to use. Users can install it in their projects 
using the install-handoff-manager.js script:

node handoffs/scripts/install-handoff-manager.js [target-directory]
`);
    
  } catch (error) {
    console.error(`Error during publication: ${error.message}`);
  }
}

// Execute the publication
publishHandoffManager();
