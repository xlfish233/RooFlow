/**
 * Configuration Merger for Handoff Publisher
 * 
 * This module provides functions for merging configuration files.
 */

const fs = require('fs');
const path = require('path');

/**
 * Initialize the module with dependencies
 * @param {Object} dependencies - Object containing module dependencies
 */
function initialize(dependencies) {
  // This module doesn't require any dependencies, but we include
  // initialize for consistency with other modules
  return module.exports;
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
    if (fs.existsSync(newPath)) {
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
      
      // Check if handoff system rules already exist
      if (!existingContent.includes('Handoff System Rules')) {
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
        // If handoff rules exist, keep existing content
        mergedContent = existingContent;
        console.log('- Handoff System Rules already exist in .clinerules, preserving existing content');
        return true;
      }
    } else {
      console.log('- No existing .clinerules file found, creating new one');
    }
    
    // Add new rules
    if (fs.existsSync(newPath)) {
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
 * @param {Object} config - Configuration object
 * @param {Object} FILES - Files object with decoded content (for embedded files)
 */
function processConfigMerging(targetDir, config, FILES) {
  // Merge configuration files if needed
  if (config.installOptions.mergeRoomodes) {
    console.log('\nConfiguring custom modes...');
    
    // Get paths for .roomodes files
    const existingRoomodesPath = path.join(targetDir, '.roomodes');
    const tempNewRoomodesPath = path.join(targetDir, '.roomodes.new');
    const tempRoomodesPath = path.join(targetDir, '.roomodes.temp');
    
    try {
      // Create a temporary file with the embedded content
      if (FILES && FILES['.roomodes']) {
        fs.writeFileSync(tempNewRoomodesPath, FILES['.roomodes']);
        console.log('- Created temporary file with embedded .roomodes content');
      } else {
        console.warn('- Warning: No embedded .roomodes content found');
        return;
      }
      
      // Create a backup of the existing .roomodes file if it exists
      if (fs.existsSync(existingRoomodesPath)) {
        try {
          // Copy the existing file to a temporary location
          fs.copyFileSync(existingRoomodesPath, tempRoomodesPath);
          console.log('- Created temporary backup of existing .roomodes file');
          
          // Now merge the existing and new content
          const success = mergeRoomodes(existingRoomodesPath, tempNewRoomodesPath, existingRoomodesPath);
          
          // Clean up the temporary files
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
        fs.copyFileSync(tempNewRoomodesPath, existingRoomodesPath);
        console.log('- Created new .roomodes file from embedded content');
      }
      
      // Clean up the temporary new file
      if (fs.existsSync(tempNewRoomodesPath)) {
        fs.unlinkSync(tempNewRoomodesPath);
      }
    } catch (error) {
      console.error(`- Error processing .roomodes: ${error.message}`);
    }
  }
  
  if (config.installOptions.mergeClinerules) {
    console.log('\nConfiguring handoff rules...');
    
    // Get paths for .clinerules files
    const existingClinerules = path.join(targetDir, '.clinerules');
    const tempNewClinerules = path.join(targetDir, '.clinerules.new');
    const tempClinerules = path.join(targetDir, '.clinerules.temp');
    
    try {
      // Create a temporary file with the embedded content
      if (FILES && FILES['.clinerules']) {
        fs.writeFileSync(tempNewClinerules, FILES['.clinerules']);
        console.log('- Created temporary file with embedded .clinerules content');
      } else {
        console.warn('- Warning: No embedded .clinerules content found');
        return;
      }
      
      // Create a backup of the existing .clinerules file if it exists
      if (fs.existsSync(existingClinerules)) {
        try {
          // Copy the existing file to a temporary location
          fs.copyFileSync(existingClinerules, tempClinerules);
          console.log('- Created temporary backup of existing .clinerules file');
          
          // Now merge the existing and new content
          const success = mergeClinerules(existingClinerules, tempNewClinerules, existingClinerules);
          
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
        fs.copyFileSync(tempNewClinerules, existingClinerules);
        console.log('- Created new .clinerules file from embedded content');
      }
      
      // Clean up the temporary new file
      if (fs.existsSync(tempNewClinerules)) {
        fs.unlinkSync(tempNewClinerules);
      }
    } catch (error) {
      console.error(`- Error processing .clinerules: ${error.message}`);
    }
  }
}

module.exports = {
  initialize,
  mergeRoomodes,
  mergeClinerules,
  processConfigMerging
};