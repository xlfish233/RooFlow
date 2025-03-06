/**
 * Configuration merging functions for the installer
 */

const fs = require('fs');
const path = require('path');

/**
 * Create a backup file with .bak extension
 * @param {string} filePath - Path to the file to backup
 * @returns {boolean} - Success status
 */
function createBackupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.bak`;
      fs.copyFileSync(filePath, backupPath);
      console.log(`- Created backup of ${path.basename(filePath)} at ${backupPath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`- Error creating backup file: ${err.message}`);
    return false;
  }
}

/**
 * Merge custom modes from two .roomodes files
 * @param {string} existingPath - Path to existing .roomodes file
 * @param {string} newPath - Path to new .roomodes file
 * @param {string} outputPath - Path to output merged .roomodes file
 * @returns {boolean} - Success status
 */
function mergeRoomodes(existingPath, newPath, outputPath) {
  try {
    // Read existing .roomodes if it exists
    let mergedContent = { customModes: [] };
    
    if (existingPath && fs.existsSync(existingPath)) {
      console.log('- Found existing .roomodes file, merging content');
      try {
        const existingContent = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
        
        // Import existing custom modes
        if (existingContent.customModes && Array.isArray(existingContent.customModes)) {
          // Filter out any existing handoff-manager mode
          mergedContent.customModes = existingContent.customModes.filter(
            mode => mode.slug !== 'handoff-manager'
          );
          console.log(`- Preserved ${mergedContent.customModes.length} existing custom modes`);
        } else {
          console.log('- No existing custom modes found or invalid format');
        }
      } catch (parseErr) {
        console.error(`- Error parsing existing .roomodes file: ${parseErr.message}`);
        console.log('- Creating new .roomodes file with handoff-manager mode only');
      }
    } else {
      console.log('- No existing .roomodes file found, creating new one');
    }
    
    // Read new .roomodes
    if (newPath && fs.existsSync(newPath)) {
      try {
        const newContent = JSON.parse(fs.readFileSync(newPath, 'utf8'));
        
        // Add handoff-manager mode
        if (newContent.customModes && Array.isArray(newContent.customModes)) {
          const handoffManagerMode = newContent.customModes.find(
            mode => mode.slug === 'handoff-manager'
          );
          
          if (handoffManagerMode) {
            mergedContent.customModes.push(handoffManagerMode);
            console.log('- Added handoff-manager mode to configuration');
          } else {
            console.warn('- Warning: handoff-manager mode not found in new .roomodes file');
          }
        }
      } catch (parseErr) {
        console.error(`- Error parsing new .roomodes file: ${parseErr.message}`);
        return false;
      }
    } else {
      console.warn('- Warning: New .roomodes file not found');
      return false;
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

/**
 * Merge .clinerules files
 * @param {string} existingPath - Path to existing .clinerules file
 * @param {string} newPath - Path to new .clinerules file
 * @param {string} outputPath - Path to output merged .clinerules file
 * @returns {boolean} - Success status
 */
function mergeClinerules(existingPath, newPath, outputPath) {
  try {
    let mergedContent = '';
    
    // Read existing .clinerules if it exists
    if (existingPath && fs.existsSync(existingPath)) {
      console.log('- Found existing .clinerules file');
      const existingContent = fs.readFileSync(existingPath, 'utf8');
      
      // Always start with existing content
      mergedContent = existingContent;
      
      // Check if handoff system rules already exist
      if (existingContent.includes('Handoff System Rules')) {
        console.log('- Handoff System Rules already exist in .clinerules, preserving existing content');
        // We just keep the existing content and don't append new rules
        return true;
      }
      
      console.log('- No existing Handoff System Rules found, appending new rules');
      
      // Add blank line if needed before appending new content
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
    if (newPath && fs.existsSync(newPath)) {
      const newContent = fs.readFileSync(newPath, 'utf8');
      console.log('- Adding Handoff System Rules to .clinerules');
      mergedContent += newContent;
    } else {
      console.warn('- Warning: New .clinerules file not found');
      return false;
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

/**
 * Process configuration files merging in the target directory
 * @param {string} targetDir - Target directory
 * @param {Object} CONFIG - Configuration object
 * @param {Object} FILES - Files object with decoded content
 */
function processConfigMerging(targetDir, CONFIG, FILES) {
  // Merge configuration files if needed
  if (CONFIG.installOptions.mergeRoomodes) {
    console.log('\nConfiguring custom modes...');
    
    // Get paths for .roomodes files
    const existingRoomodesPath = path.join(targetDir, '.roomodes');
    const tempNewRoomodesPath = path.join(targetDir, '.roomodes.new');
    const tempRoomodesPath = path.join(targetDir, '.roomodes.temp');
    
    try {
      // Create a permanent backup first if the file exists (requested safety net)
      if (fs.existsSync(existingRoomodesPath)) {
        createBackupFile(existingRoomodesPath);
      }
      
      // Create a temporary file with the new content from FILES
      if (FILES && FILES['.roomodes']) {
        fs.writeFileSync(tempNewRoomodesPath, FILES['.roomodes']);
        console.log('- Created temporary file with new .roomodes content');
      } else {
        console.error('- Error: No .roomodes content found in FILES');
        console.log('- Attempting to locate .roomodes from fallback sources...');
        
        // Try to find the file in the source directory structure
        const sourceRoomodesPath = path.join(process.cwd(), 'handoff-system', '1-handoff-custom-mode', '.roomodes');
        
        if (fs.existsSync(sourceRoomodesPath)) {
          console.log(`- Found fallback .roomodes at: ${sourceRoomodesPath}`);
          fs.copyFileSync(sourceRoomodesPath, tempNewRoomodesPath);
          console.log('- Created temporary file from fallback location');
        } else {
          console.error('- CRITICAL ERROR: Could not find .roomodes file anywhere');
          
          // Create a minimal .roomodes with just the handoff-manager mode
          const minimalRoomodes = JSON.stringify({
            customModes: [{
              slug: "handoff-manager",
              name: "Handoff Manager",
              roleDefinition: "You are Roo, a comprehensive Handoff System Manager. You help users create, organize, and utilize handoff and milestone documents to maintain optimal context between LLM sessions.",
              groups: ["read", ["edit", {"fileRegex": ".*/handoffs/(?!0-system/chat_history/).*\\.md$|.*/[0-9]+-.*?/.*\\.md$|.*/[0-9]+-.*\\.md$|\\.clinerules$", "description": "Handoff and milestone documents, and project rules"}], "command"],
              customInstructions: "Follow the handoff system guidelines to create and manage handoff documents."
            }]
          }, null, 2);
          
          fs.writeFileSync(tempNewRoomodesPath, minimalRoomodes);
          console.log('- Created minimal .roomodes file as last resort');
        }
      }
      
      // Create a backup of the existing .roomodes file if it exists
      if (fs.existsSync(existingRoomodesPath)) {
        try {
          // Copy the existing file to a temporary location for backup
          fs.copyFileSync(existingRoomodesPath, tempRoomodesPath);
          console.log('- Created temporary backup of existing .roomodes file');
          
          // Now merge the existing and new content
          const success = mergeRoomodes(existingRoomodesPath, tempNewRoomodesPath, existingRoomodesPath);
          
          // Clean up the temporary files
          if (fs.existsSync(tempRoomodesPath)) {
            fs.unlinkSync(tempRoomodesPath);
          }
          if (fs.existsSync(tempNewRoomodesPath)) {
            fs.unlinkSync(tempNewRoomodesPath);
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
          
          // Clean up the new temp file as well
          if (fs.existsSync(tempNewRoomodesPath)) {
            fs.unlinkSync(tempNewRoomodesPath);
          }
        }
      } else {
        console.log('- No existing .roomodes file found, creating new one');
        // Just copy the temp file to the destination
        fs.copyFileSync(tempNewRoomodesPath, existingRoomodesPath);
        console.log('- Created new .roomodes file');
        
        // Clean up the temp file
        if (fs.existsSync(tempNewRoomodesPath)) {
          fs.unlinkSync(tempNewRoomodesPath);
        }
      }
    } catch (err) {
      console.error(`- Error processing .roomodes: ${err.message}`);
      
      // Clean up any temp files
      if (fs.existsSync(tempRoomodesPath)) {
        fs.unlinkSync(tempRoomodesPath);
      }
      if (fs.existsSync(tempNewRoomodesPath)) {
        fs.unlinkSync(tempNewRoomodesPath);
      }
    }
  }
  
  if (CONFIG.installOptions.mergeClinerules) {
    console.log('\nConfiguring handoff rules...');
    
    // Get paths for .clinerules files
    const existingClinerules = path.join(targetDir, '.clinerules');
    const tempNewClinerules = path.join(targetDir, '.clinerules.new');
    const tempClinerules = path.join(targetDir, '.clinerules.temp');
    
    try {
      // Create a permanent backup first if the file exists (requested safety net)
      if (fs.existsSync(existingClinerules)) {
        createBackupFile(existingClinerules);
      }
      
      // Create a temporary file with the new content from FILES
      if (FILES && FILES['.clinerules']) {
        fs.writeFileSync(tempNewClinerules, FILES['.clinerules']);
        console.log('- Created temporary file with new .clinerules content');
      } else {
        console.error('- Error: No .clinerules content found in FILES');
        console.log('- Attempting to locate .clinerules from fallback sources...');
        
        // Try to find the file in the source directory structure
        const sourceClinerulesPath = path.join(process.cwd(), 'handoff-system', '1-handoff-custom-mode', '.clinerules');
        
        if (fs.existsSync(sourceClinerulesPath)) {
          console.log(`- Found fallback .clinerules at: ${sourceClinerulesPath}`);
          fs.copyFileSync(sourceClinerulesPath, tempNewClinerules);
          console.log('- Created temporary file from fallback location');
        } else {
          console.error('- CRITICAL ERROR: Could not find .clinerules file anywhere');
          
          // Create a minimal .clinerules as last resort
          const minimalClinerules = `
# Handoff System Rules

## File Safety
- Never delete handoff documents without explicit confirmation
- Use versioning when making major changes to documents
- Keep handoff numbering sequential

## Structure Rules
- Place handoff documents directly in the handoffs/ root directory
- Place chat history files only in the 0-system/chat_history directory
- Use the 0-system directory only for system files, not handoffs

## Workflow Guidelines
- Run extraction scripts before attempting to read conversation files
- Verify files moved to milestone directories have been copied correctly
- Always document deviations from original plans
`;
          
          fs.writeFileSync(tempNewClinerules, minimalClinerules);
          console.log('- Created minimal .clinerules file as last resort');
        }
      }
      
      // Create a backup of the existing .clinerules file if it exists
      if (fs.existsSync(existingClinerules)) {
        try {
          // Copy the existing file to a temporary location for backup
          fs.copyFileSync(existingClinerules, tempClinerules);
          console.log('- Created temporary backup of existing .clinerules file');
          
          // Now merge the existing and new content
          const success = mergeClinerules(existingClinerules, tempNewClinerules, existingClinerules);
          
          // Clean up the temporary files
          if (fs.existsSync(tempClinerules)) {
            fs.unlinkSync(tempClinerules);
          }
          if (fs.existsSync(tempNewClinerules)) {
            fs.unlinkSync(tempNewClinerules);
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
          
          // Clean up the new temp file as well
          if (fs.existsSync(tempNewClinerules)) {
            fs.unlinkSync(tempNewClinerules);
          }
        }
      } else {
        console.log('- No existing .clinerules file found, creating new one');
        // Just copy the temp file to the destination
        fs.copyFileSync(tempNewClinerules, existingClinerules);
        console.log('- Created new .clinerules file');
        
        // Clean up the temp file
        if (fs.existsSync(tempNewClinerules)) {
          fs.unlinkSync(tempNewClinerules);
        }
      }
    } catch (err) {
      console.error(`- Error processing .clinerules: ${err.message}`);
      
      // Clean up any temp files
      if (fs.existsSync(tempClinerules)) {
        fs.unlinkSync(tempClinerules);
      }
      if (fs.existsSync(tempNewClinerules)) {
        fs.unlinkSync(tempNewClinerules);
      }
    }
  }
}

module.exports = {
  mergeRoomodes,
  mergeClinerules,
  processConfigMerging
};