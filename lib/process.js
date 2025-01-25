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

        // Check for function declarations and add comments
        if (node.type === 'FunctionDeclaration') {
            const comment = generateJsComment(node);
            const start = node.loc.start.line - 1;
            modifiedCode = insertComment(modifiedCode, start + offset, comment);
            offset += comment.split('\n').length;
        }

        // Check for variable declarations with functions and add comments
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
         // Check for API calls (fetch or axios)
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
            ts.isFunctionDeclaration(node) ||
            ts.isArrowFunction(node) ||
            ts.isFunctionExpression(node)
        ) {
            const comment = generateTSComment(node);

            const start = node.getStart(); // 노드의 시작 위치
            const sourceFile = node.getSourceFile();
            const { line } = sourceFile.getLineAndCharacterOfPosition(start); // 시작 위치의 라인 계산

            // 주석을 함수 정의 바로 위에 삽입
            modifiedCode = insertComment(modifiedCode, line + offset, comment);

            // 삽입된 주석의 라인 수만큼 오프셋 증가
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