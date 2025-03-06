/**
 * Main installer function for the handoff manager
 */

const fs = require('fs');
const path = require('path');
const backup = require('./2-backup');
const configMerger = require('./3-config-merger');
const fileWriter = require('./4-file-writer');
const utils = require('./1-utils');

/**
 * Main installation function
 * @param {string} targetDir - Target directory
 * @param {Object} CONFIG - Configuration object
 * @param {Object} FILES - Files object with decoded content
 * @param {string} version - Version number
 * @returns {boolean} - Success status
 */
async function installHandoffManager(targetDir, CONFIG, FILES, version) {
  try {
    // First backup any existing handoff system
    const backupPaths = CONFIG.installOptions.createBackups ? 
      backup.backupExistingInstallation(targetDir) : {};
    
    // Write all files to the target directory
    fileWriter.writeAllFiles(targetDir, FILES);
    
    // Create handoffs directory if it doesn't exist
    const targetHandoffsDir = path.join(targetDir, 'handoffs');
    utils.ensureDir(targetHandoffsDir);
    
    // Merge configuration files if needed
    configMerger.processConfigMerging(targetDir, CONFIG, FILES);
    
    // Display success message and next steps
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║         Handoff Manager Install Complete         ║
║                                                  ║
╚══════════════════════════════════════════════════╝

The Handoff Manager (v${version}) has been installed to ${targetDir}

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

module.exports = {
  installHandoffManager
};