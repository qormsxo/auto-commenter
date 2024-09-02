#!/usr/bin/env node

const { Command } = require('commander');
const { processDirectory } = require('../lib/index');
const program = new Command();

program
    .version('1.0.0')
    .description('Automatically adds comments to functions in JavaScript files.')
    .option('-d, --directory <path>', 'Directory to scan', '.')
    .action(async (options) => {
        try {
            await processDirectory(options.directory);
            console.log('Comments added successfully.');
        } catch (err) {
            console.error('Error:', err);
        }
    });

program.parse(process.argv);
