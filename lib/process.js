const { generateJsComment, generateTSComment } = require('./generator');
const ts = require('typescript');

// Helper function to insert comments into code
const insertComment = (code, line, comment) => {
    const lines = code.split('\n');
    lines.splice(line, 0, comment);
    return lines.join('\n');
};

// Function to check if a node represents an API call
const isApiCall = (node) => {
    // Look for function calls with specific identifiers like axios, fetch, or any API client
    return (
        node.type === 'CallExpression' &&
        node.callee &&
        (node.callee.name === 'fetch' ||
            (node.callee.object && node.callee.object.name === 'axios'))
    );
};

// Generic function to traverse JavaScript AST
const jsUpdate = (node, callback, visited = new Set(), depth = 0, maxDepth = 1000) => {
    if (depth > maxDepth) {
        console.warn('Maximum depth reached during traversal.');
        return;
    }

    if (visited.has(node)) return;
    visited.add(node);

    callback(node);
    for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
            jsUpdate(node[key], callback, visited, depth + 1, maxDepth);
        }
    }
};

// Function to process JavaScript files and add comments for API calls
const processJSFile = async (parsedCode, modifiedCode) => {
    let offset = 0;

    jsUpdate(parsedCode, (node) => {
        if (isApiCall(node)) {
            const comment = `// This function performs an API call using ${
                node.callee.name || node.callee.object.name
            }`;
            const start = node.loc.start.line - 1;
            modifiedCode = insertComment(modifiedCode, start + offset, comment);
            offset += 1; // Adjust offset for each added comment
        }
    });

    return modifiedCode;
};

// Function to process TypeScript files and add comments for API calls
const processTsFile = async (parsedCode, modifiedCode) => {
    let offset = 0;

    function tsUpdate(node) {
        if (
            ts.isCallExpression(node) &&
            node.expression &&
            (node.expression.escapedText === 'fetch' ||
                (node.expression.expression &&
                    node.expression.expression.escapedText === 'axios'))
        ) {
            const comment = `// This function performs an API call using ${
                node.expression.escapedText || node.expression.expression.escapedText
            }`;
            const start = node.getStart();
            const startLine = modifiedCode.slice(0, start).split('\n').length - 1;
            modifiedCode = insertComment(modifiedCode, startLine + offset, comment);
            offset += 1; // Adjust offset for each added comment
        }

        ts.forEachChild(node, tsUpdate);
    }

    tsUpdate(parsedCode);
    return modifiedCode;
};

module.exports = {
    processTsFile,
    processJSFile,
};
