const ts = require('typescript');


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

// const isApiCall = (node) => {
//     return (
//         node.type === 'CallExpression' &&
//         node.callee &&
//         (node.callee.name === 'fetch' ||
//             (node.callee.object && node.callee.object.name === 'axios'))
//     );
// };
// const checkForApiCall = (node) => {
//     if (foundApiCall) return; // 이미 API 호출을 발견한 경우 순회 중단
//     if (isApiCall(node)) {
//         foundApiCall = true;
//         apiCallComment = ` * This function performs an API call using ${node.callee.name || node.callee.object.name}`;
//     }
// };


let generateJsComment = (node) => {
    let functionName = 'Anonymous Function';

    if (node.type === 'FunctionDeclaration') {
        functionName = node.id ? node.id.name : 'Anonymous Function';
    } else if (node.type === 'VariableDeclarator' && (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression")) {
        functionName = node.id ? node.id.name : 'Anonymous Function';
        node = node.init; // 화살표 함수의 본체 참조
    }

    const paramComments = node.params.map(param => {
        let paramName = "paramName";
        if (param.type === "Identifier") {
            paramName = param.name;
        } else if (param.type === "AssignmentPattern") {
            paramName = param.left.name;
        }
        return ` * @param ${paramName} - Description`;
    }).join('\n');

    const returnComment = ` * @returns - Description`;

      // API 호출 여부 확인
      let apiCallComment = '';
      let foundApiCall = false;
  
      const isApiCall = (node) => {
          return (
              node.type === 'CallExpression' &&
              node.callee &&
              (node.callee.name === 'fetch' ||
                  (node.callee.object && node.callee.object.name === 'axios'))
          );
      };
  
      const checkForApiCall = (node) => {
          if (foundApiCall) return; // 이미 API 호출을 발견한 경우 순회 중단
          if (isApiCall(node)) {
              foundApiCall = true;
              apiCallComment = ` * This function performs an API call using ${node.callee.name || node.callee.object.name}`;
          }
      };
  
      // 함수 본문 순회
      if (node.body) {
          jsUpdate(node.body, checkForApiCall);
      }

      
    return `/**
 * ${functionName}${apiCallComment ? `\n${apiCallComment}` : ''}
${paramComments}
${returnComment}
 */\n`;
};

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

    // Check for fetch or axios call inside the function body
    let apiCallComment = '';
    if (node.body && ts.isBlock(node.body)) {
        const apiCalls = node.body.statements.filter(statement =>
            ts.isExpressionStatement(statement) &&
            ts.isCallExpression(statement.expression) &&
            (statement.expression.expression.escapedText === 'fetch' ||
                (statement.expression.expression.expression &&
                    statement.expression.expression.expression.escapedText === 'axios'))
        );

        if (apiCalls.length > 0) {
            const apiName = apiCalls.some(call => call.expression.expression.escapedText === 'fetch') ? 'fetch' : 'axios';
            apiCallComment = ` * This function performs an API call using ${apiName}`;
        }
    }

    

    return `/**
 * ${functionName}${apiCallComment ? `\n${apiCallComment}` : ''}
${paramComments}
${returnComment}
 */\n`;
};

module.exports = {
    generateJsComment,
    generateTSComment
};
