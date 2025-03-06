#!/usr/bin/env node

/**
 * extract_conversation.js
 * 
 * Extracts the core conversation (user prompts and LLM responses) from Cline task files,
 * removing file contents, tool results, and other non-essential elements.
 * 
 * Optimized for Roo-Code's export format:
 * - Handles "**User:**" and "**Assistant:**" headers with messages separated by "---"
 * - Removes [Tool Use], [Tool], [Tool (Error)], and [Image] references
 * - Preserves thinking sections and essential conversation flow
 * - Removes file contents that might cause bias in future LLM interactions
 * 
 * Usage:
 *     node extract_conversation.js input_file [output_file]
 * 
 * If output_file is not specified, a file with "_clean" suffix will be created.
 */

const fs = require('fs');
const path = require('path');

// Regular expression patterns for content identification
const PATTERNS = {
    // Environment details and structural content
    environmentDetails: /<environment_details>.*?<\/environment_details>/s,
    taskTag: /<task>(.*?)<\/task>/s,
    feedbackTag: /<feedback>(.*?)<\/feedback>/s,
    userMessageTag: /<user_message>(.*?)<\/user_message>/s,
    answerTag: /<answer>(.*?)<\/answer>/s,
    
    // File content and results to remove
    fileContentTag: /<file_content path=".*?">.*?<\/file_content>/s,
    toolResult: /\[[^\]]+\] Result:.*?(?=\n\n|\Z)/s,
    
    // Roo-Code specific export patterns
    rooToolUse: /\[Tool Use: .*?\].*?(?=\n\n|\Z)/s,
    rooToolResult: /\[Tool(?:\s\(Error\))?\]\n.*?(?=\n\n|\Z)/s,
    rooImageReference: /\[Image\]/g,
    
    // More aggressively remove code blocks and file outputs
    fileOutputBlocks: /```(?:\w+)?\n.*?```/s,
    fileListing: /(?:Directory\s+)?(?:File|Listing)[^\n]*?\n(?:-+\n)?(?:(?:\s*[-\w./\\]+\s*\n)+)/s,
    filePathReferences: /(?:in|from|at|path:|file:)\s+["'`][\/\\]?[\w\-\/\\\.]+["'`]/sg,
    
    // Assistant thinking and tool use
    thinking: /<thinking>(.*?)<\/thinking>/s,
    attemptCompletion: /<attempt_completion>.*?<result>(.*?)<\/result>.*?<\/attempt_completion>/s,
    
    // Tool use patterns
    toolUsePatterns: {
        // Tool uses to completely remove
        writeToFile: /<write_to_file>.*?<\/write_to_file>/s,
        applyDiff: /<apply_diff>.*?<\/apply_diff>/s,
        executeCommand: /<execute_command>.*?<\/execute_command>/s,
        browserAction: /<browser_action>.*?<\/browser_action>/s,
        switchMode: /<switch_mode>.*?<\/switch_mode>/s,
        useMcpTool: /<use_mcp_tool>.*?<\/use_mcp_tool>/s,
        accessMcpResource: /<access_mcp_resource>.*?<\/access_mcp_resource>/s,
        insertContent: /<insert_content>.*?<\/insert_content>\s*/s,
        searchAndReplace: /<search_and_replace>.*?<\/search_and_replace>\s*/s,
        
        // Tool uses to keep the question
        askFollowupQuestion: /<ask_followup_question>\s*<question>(.*?)<\/question>.*?<\/ask_followup_question>/s,
        
        // Tool uses to remove completely
        readFile: /<read_file>.*?<\/read_file>\s*/s,
        listFiles: /<list_files>.*?<\/list_files>\s*/s,
        searchFiles: /<search_files>.*?<\/search_files>\s*/s,
        listCodeDefinitionNames: /<list_code_definition_names>.*?<\/list_code_definition_names>\s*/s,
    },
    
    // Code formatting
    lineNumbers: /^\s*\d+ \|/gm,
    
    // Duplicated responses
    systemErrorMessages: /\[ERROR\].*?ensure proper parsing and execution.*?Next Steps/s,
};

/**
 * Extract the conversation from a Cline task file.
 * @param {string} filePath - Path to the input file
 * @returns {Array<{speaker: string, message: string}>} - Array of conversations
 */
function extractConversation(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Pattern optimized for Roo-Code's export format
    // Format: "**User:**" or "**Assistant:**" followed by content and separated by "---"
    const pattern = /\*\*(User|Assistant):\*\*\n\n(.*?)(?=\n---\n\n\*\*(?:User|Assistant):\*\*|\Z)/gs;
    
    const conversation = [];
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
        const speaker = match[1];
        const message = match[2];
        
        // Clean the message based on speaker type
        const cleanMessage = speaker === 'User' 
            ? cleanUserMessage(message) 
            : cleanAssistantMessage(message);
        
        // Verify we have content after cleaning
        if (cleanMessage.trim()) {
            conversation.push({ speaker, message: cleanMessage });
        }
    }
    
    return conversation;
}

/**
 * Clean a user message by removing file content and keeping essential parts.
 * @param {string} message - The raw message
 * @returns {string} - The cleaned message
 */
function cleanUserMessage(message) {
    // Remove environment details
    message = message.replace(PATTERNS.environmentDetails, '');
    
    // Remove tool result sections
    message = message.replace(PATTERNS.toolResult, '');
    
    // Remove file content blocks
    message = message.replace(PATTERNS.fileContentTag, '');
    
    // Remove Roo-Code specific patterns
    message = message.replace(PATTERNS.rooToolUse, '');
    message = message.replace(PATTERNS.rooToolResult, '');
    message = message.replace(PATTERNS.rooImageReference, '');
    
    // Preserve content but remove tags
    message = message.replace(PATTERNS.taskTag, '$1');
    message = message.replace(PATTERNS.feedbackTag, '$1');
    message = message.replace(PATTERNS.userMessageTag, '$1');
    message = message.replace(PATTERNS.answerTag, '$1');
    
    // Remove line numbers in code blocks
    message = message.replace(PATTERNS.lineNumbers, '');
    
    // Remove system error messages
    message = message.replace(PATTERNS.systemErrorMessages, '');
    
    // Remove file output blocks
    message = message.replace(PATTERNS.fileOutputBlocks, '');
    
    // Remove file path references
    message = message.replace(PATTERNS.filePathReferences, '');
    
    // Clean up whitespace
    message = message.replace(/\n{3,}/g, '\n\n');
    message = message.replace(/[ \t]+\n/g, '\n');
    message = message.replace(/\n+[ \t]+\n+/g, '\n\n');
    
    return message.trim();
}

/**
 * Clean an assistant message by removing tool usage and keeping thought process.
 * @param {string} message - The raw message
 * @returns {string} - The cleaned message
 */
function cleanAssistantMessage(message) {
    // Process thinking sections without removing them
    message = message.replace(PATTERNS.thinking, (match, thinkingContent) => {
        // Clean the thinking section content
        let cleanedThinking = thinkingContent
            .replace(PATTERNS.fileContentTag, '')
            .replace(PATTERNS.fileOutputBlocks, '')
            .replace(PATTERNS.filePathReferences, '');
        
        return `<thinking>${cleanedThinking}</thinking>`;
    });
    
    // Extract result content from attempt_completion
    message = message.replace(PATTERNS.attemptCompletion, '$1');
    
    // Remove tool uses
    for (const [toolName, pattern] of Object.entries(PATTERNS.toolUsePatterns)) {
        if (toolName === 'askFollowupQuestion') {
            // Keep just the question for this tool
            message = message.replace(pattern, '$1');
        } else {
            // Remove other tool uses completely
            message = message.replace(pattern, '');
        }
    }
    
    // Remove Roo-Code specific patterns
    message = message.replace(PATTERNS.rooToolUse, '');
    message = message.replace(PATTERNS.rooToolResult, '');
    message = message.replace(PATTERNS.rooImageReference, '');
    
    // Remove file content blocks
    message = message.replace(PATTERNS.fileContentTag, '');
    
    // Remove line numbers in code blocks
    message = message.replace(PATTERNS.lineNumbers, '');
    
    // Remove system error messages
    message = message.replace(PATTERNS.systemErrorMessages, '');
    
    // Remove file output blocks
    message = message.replace(PATTERNS.fileOutputBlocks, '');
    
    // Remove file path references
    message = message.replace(PATTERNS.filePathReferences, '');
    
    // Clean up whitespace
    message = message.replace(/\n{3,}/g, '\n\n');
    message = message.replace(/[ \t]+\n/g, '\n');
    message = message.replace(/\n+[ \t]+\n+/g, '\n\n');
    
    return message.trim();
}

/**
 * Remove duplicate paragraphs and sections in content.
 * @param {string} content - The content to clean
 * @returns {string} - Content with duplicates removed
 */
function removeDuplicates(content) {
    // Split by paragraph
    const paragraphs = content.split(/\n\n+/);
    
    // Use a set to track seen paragraphs
    const seen = new Set();
    const uniqueParagraphs = [];
    
    for (const paragraph of paragraphs) {
        // Skip very short paragraphs or empty ones
        if (paragraph.trim().length < 10) {
            uniqueParagraphs.push(paragraph);
            continue;
        }
        
        // Create a simplified version for comparison (lowercase, no spaces)
        const simplified = paragraph.toLowerCase().replace(/\s+/g, '');
        
        // Check if we've seen something very similar
        if (!seen.has(simplified)) {
            seen.add(simplified);
            uniqueParagraphs.push(paragraph);
        }
    }
    
    return uniqueParagraphs.join('\n\n');
}

/**
 * Save the cleaned conversation to a file.
 * @param {Array<{speaker: string, message: string}>} conversation - The cleaned conversation
 * @param {string} outputFile - The output file path
 * @param {string} inputFile - The input file path
 * @returns {Object} - Metrics about the cleaning process
 */
function saveCleanConversation(conversation, outputFile, inputFile) {
    const output = conversation.map((item, index) => {
        const prefix = index > 0 ? "\n---\n\n" : "";
        return `${prefix}**${item.speaker}:**\n\n${item.message}`;
    }).join('');
    
    fs.writeFileSync(outputFile, output);
    
    // Count tokens in original and cleaned files
    const originalSize = fs.statSync(inputFile).size;
    const cleanedSize = fs.statSync(outputFile).size;
    const reduction = ((originalSize - cleanedSize) / originalSize) * 100;
    
    return {
        originalSizeBytes: originalSize,
        cleanedSizeBytes: cleanedSize,
        reductionPercentage: reduction.toFixed(2)
    };
}

/**
 * Main function to parse arguments and run the script.
 */
function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Usage: node extract_conversation.js input_file [output_file]");
        return;
    }
    
    const inputFile = args[0];
    
    // Generate default output filename if not specified
    let outputFile;
    if (args.length >= 2) {
        outputFile = args[1];
    } else {
        const parsedPath = path.parse(inputFile);
        outputFile = path.join(
            parsedPath.dir,
            `${parsedPath.name}_clean${parsedPath.ext}`
        );
    }
    
    // Extract and clean conversation
    const conversation = extractConversation(inputFile);
    
    // Apply duplicate removal to each message
    const cleanedConversation = conversation.map(({ speaker, message }) => ({
        speaker,
        message: removeDuplicates(message)
    }));
    
    // Save cleaned conversation
    const metrics = saveCleanConversation(cleanedConversation, outputFile, inputFile);
    
    console.log(`Cleaned conversation with ${cleanedConversation.length} messages saved to ${outputFile}`);
    console.log(`Size reduction: ${metrics.originalSizeBytes.toLocaleString()} bytes → ${metrics.cleanedSizeBytes.toLocaleString()} bytes (${metrics.reductionPercentage}%)`);
}

// Run the script
main();