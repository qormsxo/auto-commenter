const { generateJsComment, generateTSComment } = require('./generator');
const ts = require('typescript');

const insertComment = (code, line, comment) => {
    const lines = code.split('\n');
    lines.splice(line, 0, comment);
    return lines.join('\n');
}


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
}

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
    }
    return modifiedCode;
}

const processTsFile = async (parsedCode, modifiedCode) => {
    let offset = 0;

    function tsUpdate(node) {
        if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
            const comment = generateTSComment(node);
            const start = node.getStart();
            const startLine = modifiedCode.slice(0, start).split('\n').length - 1;
            modifiedCode = insertComment(modifiedCode, startLine + offset, comment);
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