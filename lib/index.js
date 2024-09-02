const fs = require('fs-extra');
const path = require('path');
const acorn = require('acorn');
const ts = require('typescript');

const {processJSFile,processTsFile } = require("./process")

const addCommentsToFile = async (filePath) => {
    try {
        const extname = path.extname(filePath);
        const isTypeScript = extname === '.ts';
        const code = await fs.readFile(filePath, 'utf-8');

        let parsedCode, modifiedCode = code;
        if (isTypeScript) {
            parsedCode = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);
            modifiedCode = await processTsFile(parsedCode, modifiedCode);
        } else {
            parsedCode = acorn.parse(code, { ecmaVersion: 2020, locations: true });
            modifiedCode = await processJSFile(parsedCode, modifiedCode);
        }

        await fs.writeFile(filePath, modifiedCode, 'utf-8');
    } catch (error) {
        console.error(`Failed to process file ${filePath}:`, error);
    }
}


const processDirectory = async (directory) => {
    try {
        const files = await fs.readdir(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                await processDirectory(filePath);
            } else if (file.endsWith('.js') || file.endsWith('.ts')) {
                await addCommentsToFile(filePath);
            }
        }
    } catch (error) {
        console.error(`Failed to process directory ${directory}:`, error);
    }
}

module.exports = {
    processDirectory
};
