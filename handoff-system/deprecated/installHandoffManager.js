// Main installation function
async function installHandoffManager() {
  try {
    // First backup any existing handoff system
    const backupPaths = CONFIG.installOptions.createBackups ? 
      backupExistingInstallation(targetDir) : {};
    
    // Write all files to the target directory
    writeAllFiles(targetDir);
    
    // Create handoffs directory if it doesn't exist
    const targetHandoffsDir = path.join(targetDir, 'handoffs');
    ensureDir(targetHandoffsDir);
    
    // Merge configuration files if needed
    if (CONFIG.installOptions.mergeRoomodes) {
      const existingRoomodesPath = path.join(targetDir, '.roomodes');
      const targetRoomodesPath = path.join(targetDir, '.roomodes');
      
      console.log('\nConfiguring custom modes...');
      if (fs.existsSync(existingRoomodesPath)) {
        mergeRoomodes(existingRoomodesPath, targetRoomodesPath, targetRoomodesPath);
      }
    }
    
    if (CONFIG.installOptions.mergeClinerules) {
      const existingClinerules = path.join(targetDir, '.clinerules');
      const targetClinerules = path.join(targetDir, '.clinerules');
      
      console.log('\nConfiguring handoff rules...');
      if (fs.existsSync(existingClinerules)) {
        mergeClinerules(existingClinerules, targetClinerules, targetClinerules);
      }
    }
    
    // Display success message and next steps
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║         Handoff Manager Install Complete         ║
║                                                  ║
╚══════════════════════════════════════════════════╝

The Handoff Manager (v${publishConfig.version}) has been installed to ${targetDir}

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