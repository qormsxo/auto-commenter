const { generateJsComment, generateTSComment } = require('./generator');
const ts = require('typescript');

const insertComment = (code, line, comment) => {
    const lines = code.split('\n');
    lines.splice(line, 0, comment);
    return lines.join('\n');
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

const processTsFile = async (parsedCode, modifiedCode) => {

    let offset = 0;

    function tsUpdate(node) {
        if (
            ts.isFunctionDeclaration(node) || // 일반 함수
            ts.isArrowFunction(node) || // 화살표 함수
            ts.isFunctionExpression(node) || // 익명 함수
            ts.isMethodDeclaration(node) // ✅ 클래스 내부 메서드
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