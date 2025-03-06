/**
 * File Utilities for Handoff Publisher
 * 
 * This module provides utility functions for file operations.
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
 * @param {number} maxFileSize - Maximum file size to include
 * @param {Object} result - Object to collect file paths
 * @returns {Object} - Object with file paths and contents
 */
function collectFiles(dir, baseDir, maxFileSize, result = {}) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      
      if (entry.isDirectory()) {
        collectFiles(fullPath, baseDir, maxFileSize, result);
      } else {
        // Skip files that are too large
        const stats = fs.statSync(fullPath);
        if (stats.size > maxFileSize) {
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
  initialize,
  ensureDirectoryForFile,
  encodeFileToBase64,
  collectFiles,
  backupExistingInstallation
};