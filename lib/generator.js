const ts = require('typescript');

let generateJsComment = (node) => {
    let functionName = 'Anonymous Function';
    if (node.type === 'FunctionDeclaration') {
        functionName = node.id ? node.id.name : 'Anonymous Function';

    } else if (node.type === 'VariableDeclarator' && (node.init.type == "ArrowFunctionExpression" || node.init.type == "FunctionExpression")) { // 변수로 선언된 화살표 함수

        functionName = node.id ? node.id.name : 'Anonymous Function';

        node = node.init;
    }

    const paramComments = node.params.map(param => {
        let paramName = "paramName";
        if (param.type === "Identifier") {
            paramName = param.name;
        } else if (param.type === "AssignmentPattern") {
            paramName = param.left.name
        }

        return ` * @param ${paramName} - Description`;
    }).join('\n');

    const returnComment = ` * @returns - Description`;

    return `/**
 * ${functionName}
${paramComments}
${returnComment}
 */\n`;
}

let generateTSComment = (node) => {
    let functionName = 'Anonymous Function';
    if (node.name) {
        functionName = node.name.text;
    } else if (node.parent && ts.isVariableDeclaration(node.parent)) {
        functionName = node.parent.name.getText();
    }

    const paramComments = node.parameters.map(param => {
        const paramName = param.name.getText();
        const paramType = param.type ? param.type.getText() : '';
        return ` * @param ${paramType} ${paramName} - Description`;
    }).join('\n');

    const returnType = node.type ? node.type.getText() : '';
    const returnComment = ` * @returns ${returnType} - Description`;

    return `/**
 * ${functionName}
${paramComments}
${returnComment}
 */\n`;
}

module.exports = {
    generateJsComment,
    generateTSComment
};
