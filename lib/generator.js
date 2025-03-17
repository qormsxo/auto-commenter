const ts = require('typescript');

const isApiCall = (node) => {
    return (
        node.type === 'CallExpression' &&
        node.callee &&
        (node.callee.name === 'fetch' ||
            (node.callee.object && node.callee.object.name === 'axios'))
    );
};

const generateComment = (functionName, paramComments, returnComment, apiCallComment) => {
    return `/**
 * ${functionName}${apiCallComment ? `\n${apiCallComment}` : ''}
${paramComments}
${returnComment}
 */\n`;
};


const generateJsComment = (node) => {
    let functionName = 'Anonymous Function';

    if (node.type === 'FunctionDeclaration') {
        functionName = node.id ? node.id.name : 'Anonymous Function';
    } else if (
        node.type === 'VariableDeclarator' &&
        (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')
    ) {
        functionName = node.id ? node.id.name : 'Anonymous Function';
        node = node.init; 
    }

    const paramComments = node.params
        .map((param) => {
            let paramName = 'paramName';
            if (param.type === 'Identifier') {
                paramName = param.name;
            } else if (param.type === 'AssignmentPattern') {
                paramName = param.left.name;
            }
            return ` * @param ${paramName} - Description`;
        })
        .join('\n');

    const returnComment = ` * @returns - Description`;

    let apiCallComment = '';

    let foundApiCall = false;

    const checkForApiCall = (node) => {
        if (foundApiCall) return;
        if (isApiCall(node)) {
            foundApiCall = true;
            apiCallComment = ` * This function performs an API call using ${node.callee.name || node.callee.object.name}`;
        }
    };
    if (node.body) {
        jsUpdate(node.body, checkForApiCall);
    }

    return generateComment(functionName, paramComments, returnComment, apiCallComment);
};

const generateTSComment = (node) => {
    let functionName = 'Anonymous Function';

    if (node.name) {
        functionName = node.name.text;
    } else if (node.parent && ts.isVariableDeclaration(node.parent)) {
        functionName = node.parent.name.getText();
    }

    const paramComments = node.parameters
        .map((param) => {
            const paramName = param.name.getText();
            const paramType = param.type ? param.type.getText() : '';
            return ` * @param ${paramType} ${paramName} - Description`;
        })
        .join('\n');

    const returnType = node.type ? node.type.getText() : '';
    const returnComment = ` * @returns ${returnType} - Description`;

    let apiCallComment = '';
    if (node.body && node.body.statements) {
        const apiCalls = node.body.statements.filter((statement) => {
            const statementText = statement.getText();
            return statementText.includes('axios.') || statementText.includes('fetch(');
        });

        if (apiCalls.length > 0) {
            const apiType = apiCalls.some((call) => call.getText().includes('axios.')) ? 'axios' : 'fetch';
            apiCallComment = ` * This function performs an API call using ${apiType}`;
        }
    }

    return generateComment(functionName, paramComments, returnComment, apiCallComment);
};

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

module.exports = {
    generateJsComment,
    generateTSComment,
};
