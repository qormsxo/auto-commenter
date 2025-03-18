const { generateJsComment, generateTSComment } = require('./generator');
const ts = require('typescript');


/**
 * Inserts a comment at a specified line in the given code.
 * @param {string} code - The original source code.
 * @param {number} line - The line number where the comment should be inserted.
 * @param {string} comment - The comment text to insert.
 * @returns {string} The modified source code with the inserted comment.
 */
const insertComment = (code, line, comment) => {
    const lines = code.split('\n');
    lines.splice(line, 0, comment);
    return lines.join('\n');
}

/**
 * Processes a JavaScript file, adding JSDoc comments for functions and API calls.
 * @param {object} parsedCode - The parsed AST of the JavaScript code.
 * @param {string} modifiedCode - The original JavaScript code as a string.
 * @returns {Promise<string>} The modified JavaScript code with inserted comments.
 */
const processJSFile = async (parsedCode, modifiedCode) => {
    let offset = 0;

    for (const node of parsedCode.body) {

        if (node.type === 'FunctionDeclaration') {
            const comment = generateJsComment(node);
            const start = node.loc.start.line - 1;
            modifiedCode = insertComment(modifiedCode, start + offset, comment);
            offset += comment.split('\n').length;
        }

        if (node.type === 'VariableDeclaration') {
            for (const declaration of node.declarations) {
                if (declaration.init && (declaration.init.type === 'ArrowFunctionExpression' || declaration.init.type === 'FunctionExpression')) {
                    const comment = generateJsComment(declaration);
                    const start = node.loc.start.line - 1;
                    modifiedCode = insertComment(modifiedCode, start + offset, comment);
                    offset += comment.split('\n').length;
                }
            }
        }

         if (
            node.type === 'CallExpression' &&
            node.callee &&
            (node.callee.name === 'fetch' || node.callee.object?.name === 'axios')
        ) {
            const comment = `// This function performs an API call using ${node.callee.name || node.callee.object.name}`;
            const start = node.loc.start.line - 1;
            modifiedCode = insertComment(modifiedCode, start + offset, comment);
            offset += comment.split('\n').length;
        }
    
    }
    return modifiedCode;
};


/**
 * Processes a TypeScript file, adding JSDoc comments for functions and methods.
 * @param {object} parsedCode - The parsed AST of the TypeScript code.
 * @param {string} modifiedCode - The original TypeScript code as a string.
 * @returns {Promise<string>} The modified TypeScript code with inserted comments.
 */
const processTsFile = async (parsedCode, modifiedCode) => {

    let offset = 0;

    function tsUpdate(node) {
        if (
            ts.isFunctionDeclaration(node) ||
            ts.isArrowFunction(node) ||
            ts.isFunctionExpression(node) ||
            ts.isMethodDeclaration(node)
        ) {
            const comment = generateTSComment(node);
            const sourceFile = node.getSourceFile();
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

            modifiedCode = insertComment(modifiedCode, line + offset, comment);
            offset += comment.split('\n').length;
        }

        ts.forEachChild(node, tsUpdate);
    }

    tsUpdate(parsedCode);
    return modifiedCode;
}

module.exports = {
    processTsFile,
    processJSFile
}