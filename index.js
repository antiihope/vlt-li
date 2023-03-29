#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const process = require('process');
const yargs = require('yargs');

const COMMANDS_FILE = 'commands.json';
const commandsFilePath = path.join(__dirname, COMMANDS_FILE);
const commands = loadCommands();

// define CLI commands and options using yargs
const argv = yargs
  .command('set', 'Save a command to the configuration')
  .option('i', {
    alias: 'input',
    describe: 'The command name to save',
    type: 'string',
  })
  .option('o', {
    alias: 'output',
    describe: 'The command to execute when the input is called',
    type: 'string',
  })
  .command('config', 'Print the saved commands configuration')
  .help()
  .alias('h', 'help').argv;

// handle CLI commands and options
if (argv._.includes('set')) {
  // vlt set [commandName] [command]
  const commandName = argv.input ?? argv._[1];
  const command = argv.output ?? argv._[2];
  saveCommand(commandName, command);
  //   color: green
  console.log(`Command saved successfully: ${commandName} -> ${command}`);
} else if (argv._.includes('config')) {
  console.log('Saved commands:');
  console.log(commands);
} else if (argv._.length > 0) {
  const commandName = argv._[0];
  const command = getCommand(commandName);
  if (command) {
    runCommand(command, argv._.slice(1));
  } else {
    console.error(`Command not found: "${commandName}"`);
    process.exit(1);
  }
} else {
  console.error('No command specified');
  process.exit(1);
}

// load saved commands from configuration file
function loadCommands() {
  try {
    const data = fs.readFileSync(commandsFilePath, { encoding: 'utf8' });
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function saveCommand(commandName, command) {
  commands[commandName] = command;
  fs.writeFileSync(commandsFilePath, JSON.stringify(commands, null, 2));
}

// retrieve a command from the saved commands
function getCommand(commandName) {
  return commands[commandName];
}

// execute a command with given arguments
function runCommand(command, args) {
  const { exec } = require('child_process');
  console.log(command + ' ' + args.join(' '));
  const child = exec(command + ' ' + args.join(' '), { stdio: 'inherit' });
  child.on('exit', (code) => {
    process.exit(code);
  });
  child.stdout.pipe(process.stdout);
}
