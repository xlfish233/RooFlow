#!/usr/bin/env node
/**
 * Handoff Publisher Runner
 *
 * This script runs the handoff-publisher package to generate the installer.
 * It first cleans the target handoff-manager directory to ensure a clean installation.
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Get directory paths
const publisherDir = path.join(__dirname, 'handoff-publisher');
const targetDir = path.join(__dirname, '..', 'handoff-manager', 'single-script');

/**
 * Recursively deletes files and subdirectories in a directory
 * while preserving specified directories and their contents
 * @param {string} dirPath - Path to the directory to clean
 * @param {Array<string>} preservePaths - Paths to preserve (relative to dirPath)
 */
function cleanDirectory(dirPath, preservePaths = []) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return;
  }

  // Convert preserve paths to absolute paths for easier comparison
  const absolutePreservePaths = preservePaths.map(p => path.join(dirPath, p));
  
  console.log(`Cleaning directory: ${dirPath}`);
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    
    // Check if this path should be preserved
    const shouldPreserve = absolutePreservePaths.some(preservePath =>
      filePath === preservePath || filePath.startsWith(preservePath + path.sep)
    );
    
    if (shouldPreserve) {
      console.log(`Preserving: ${filePath}`);
      continue;
    }
    
    if (fs.lstatSync(filePath).isDirectory()) {
      // Recursively clean subdirectories then remove the directory
      cleanDirectory(filePath, []);  // No need to pass preservePaths here as we already checked
      fs.rmdirSync(filePath);
    } else {
      // Remove files
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  }
}

// Paths to preserve in the handoff-manager directory
const pathsToPreserve = [
  'handoffs/0-system/chat_history',  // Preserve chat history
  'handoffs'                         // Preserve user handoffs
];

// Clean the target directory before publishing but preserve specified paths
try {
  cleanDirectory(targetDir, pathsToPreserve);
  console.log(`✅ Successfully cleaned target directory while preserving specified paths`);
} catch (err) {
  console.error(`❌ Error cleaning target directory: ${err.message}`);
  process.exit(1);
}

// Run the publisher
console.log('\nRunning Handoff Publisher...');
const publisher = spawn('node', [path.join(publisherDir, 'index.js')], {
  stdio: 'inherit',
  cwd: __dirname
});

publisher.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Handoff Publisher completed successfully.');
  } else {
    console.error(`❌ Handoff Publisher exited with code ${code}`);
  }
});