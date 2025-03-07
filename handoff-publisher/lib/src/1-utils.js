/**
 * Utility functions for the installer
 */

const fs = require('fs');
const path = require('path');

/**
 * Create directories if they don't exist
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} - Whether the directory was created
 */
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

/**
 * Helper function to decode base64 content
 * @param {string} base64Content - Base64 encoded content
 * @returns {string} - Decoded content
 */
function decodeBase64(base64Content) {
  return Buffer.from(base64Content, 'base64').toString('utf8');
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

module.exports = {
  ensureDir,
  backupDirectory,
  decodeBase64,
  encodeFileToBase64,
  collectFiles,
  ensureDirectoryForFile
};