const ts = require('typescript');



/**
 * Checks if a given node is inside a class declaration.
 * @param {object} node - The AST node to check.
 * @returns {boolean} True if the node is inside a class, false otherwise.
 */
const isInsideClass = (node) => {
    let current = node.parent;
    while (current) {
        if (ts.isClassDeclaration(current)) {
            return true;
        }
        current = current.parent;
    }
    return false;
};

/**
 * Determines if a given node represents an API call (fetch or axios).
 * @param {object} node - The AST node to check.
 * @returns {boolean} True if the node is an API call, false otherwise.
 */
const isApiCall = (node) => {
    return (
        node.type === 'CallExpression' &&
        node.callee &&
        (node.callee.name === 'fetch' ||
            (node.callee.object && node.callee.object.name === 'axios'))
    );
};

/**
 * Generates a JSDoc comment for a given function.
 * @param {string} functionName - The name of the function.
 * @param {string} paramComments - The parameter descriptions.
 * @param {string} returnComment - The return description.
 * @param {string} apiCallComment - A comment about API calls if applicable.
 * @returns {string} The generated JSDoc comment.
 */

const generateComment = (functionName, paramComments, returnComment, apiCallComment) => {
    return `/**
 * ${functionName}${apiCallComment ? `\n${apiCallComment}` : ''}
${paramComments}
${returnComment}
 */\n`;
};

/**
 * Generates a JSDoc comment for a JavaScript function.
 * @param {object} node - The AST node representing the function.
 * @returns {string} The generated JSDoc comment.
 */

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
    
    // Recursively check for API calls within the function body
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


/**
 * Generates a JSDoc comment for a TypeScript function.
 * @param {object} node - The AST node representing the function.
 * @returns {string} The generated JSDoc comment.
 */
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

    const isClassMethod = isInsideClass(node);
    const indent = isClassMethod ? '    ' : ''; 

    const formattedComment = generateComment(functionName, paramComments, returnComment, apiCallComment)
        .split('\n')
        .map(line => indent + line) 
        .join('\n');

    return formattedComment;
};

/**
 * Recursively traverses a JavaScript AST node and applies a callback function.
 * @param {object} node - The AST node to traverse.
 * @param {function} callback - The function to apply to each node.
 * @param {Set} visited - A set of visited nodes to avoid infinite loops.
 * @param {number} depth - The current recursion depth.
 * @param {number} maxDepth - The maximum allowed recursion depth.
 */
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
