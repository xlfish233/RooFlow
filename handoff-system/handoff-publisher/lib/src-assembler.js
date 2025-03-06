/**
 * Source Code Assembler for Handoff Publisher
 * 
 * This module provides functions for assembling the source code components
 * based on the configuration in src-config.json.
 */

const fs = require('fs');
const path = require('path');

// This will be set by the importer if needed
let fileUtils;

/**
 * Initialize the module with dependencies
 * @param {Object} dependencies - Object containing module dependencies
 */
function initialize(dependencies) {
  fileUtils = dependencies['utils'];
  return module.exports;
}

/**
 * Extract function implementations from source code
 * @param {string} source - Source code content
 * @returns {string} - Extracted function implementations
 */
function extractFunctionImplementations(source) {
  // Remove imports, exports, and module-specific code
  let code = source.replace(/const\s+\w+\s*=\s*require\(['"][^'"]+['"]\);?/g, '');
  code = code.replace(/module\.exports\s*=\s*{[^}]*};?/g, '');
  
  // Clean up the code by removing excessive blank lines
  code = code.replace(/\n{3,}/g, '\n\n');
  
  return code;
}

/**
 * Assemble source code from components
 * @param {string} componentsPath - Path to components directory
 * @param {Object} srcConfig - Source configuration object
 * @returns {Object} The assembled source code functions by category
 */
function assembleSourceCode(componentsPath, srcConfig) {
  console.log('\nAssembling source code from components...');
  console.log(`Looking for components in: ${componentsPath}`);
  
  try {
    let assembledComponents = {};
    
    // Process each component in order
    for (const component of srcConfig.components) {
      if (component.file) {
        // This is a file component
        const componentPath = path.join(componentsPath, component.file);
        if (fs.existsSync(componentPath)) {
          const componentContent = fs.readFileSync(componentPath, 'utf8');
          const processedContent = extractFunctionImplementations(componentContent);
          
          // Use the filename without extension as the key
          const componentName = component.file.replace(/\.js$/, '').replace(/^\d+-/, '');
          assembledComponents[componentName] = processedContent;
          
          console.log(`- Added component: ${component.file}`);
        } else {
          const errorMsg = `Component file not found: ${component.file}`;
          console.error(`- ${errorMsg} (searched at ${componentPath})`);
          if (srcConfig.errorHandling.missingFile === "error" && 
              !srcConfig.errorHandling.continueOnError) {
            throw new Error(errorMsg);
          }
        }
      }
    }
    
    console.log(`- Source code assembled from ${Object.keys(assembledComponents).length} components`);
    return assembledComponents;
  } catch (err) {
    console.error(`- Error assembling source code: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  initialize,
  assembleSourceCode,
  extractFunctionImplementations
};