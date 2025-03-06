/**
 * File writing functions for the installer
 */

const fs = require('fs');
const path = require('path');

/**
 * Function to write all files from the FILES object
 * @param {string} targetDir - Target directory
 * @param {Object} FILES - Files object with decoded content
 */
function writeAllFiles(targetDir, FILES) {
  console.log('\nWriting files...');
  
  // Track which critical files we've processed
  const criticalFiles = {
    '.roomodes': false,
    '.clinerules': false
  };
  
  for (const [filePath, content] of Object.entries(FILES)) {
    try {
      // Check if this is a critical file
      if (filePath === '.roomodes' || filePath === '.clinerules') {
        // Mark as processed but don't write yet - will be handled by config merger
        criticalFiles[filePath] = true;
        console.log(`- Registered ${filePath} for merging`);
        continue;
      }
      
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
  
  // Ensure critical files exist by writing them directly if not found in target directory
  for (const [filePath, processed] of Object.entries(criticalFiles)) {
    if (processed) {
      // We'll let the config merger handle these
      continue;
    }
    
    // Critical file was not in FILES
    console.warn(`- Warning: ${filePath} not included in installation package`);
  }
}

module.exports = {
  writeAllFiles
};