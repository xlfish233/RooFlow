/**
 * Backup functions for the installer
 */

const fs = require('fs');
const path = require('path');

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

module.exports = {
  backupExistingInstallation
};