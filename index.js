/**
 * @file    Entry point for the library. Exposes the external facing function that accepts the input defined in the API documentation.
 * @author  TheJaredWilcurt
 */
'use strict';

const exec = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

function throwError (message, error) {
  console.error(
    '________________________________\n' +
    'Get-Windows-Shortcut-Properties:\n' +
    message,
    error
  );
}

const windowShortcutProperties = [
  'TargetPath',
  'Arguments',
  'Description',
  'WorkingDirectory',
  'IconLocation',
  'WindowStyle',
  'Hotkey'
];

function generateCommands (lnkFile) {
  const commands = [];

  for (let property of windowShortcutProperties) {
    const command = [
      '(New-Object -COM WScript.Shell).CreateShortcut(',
      lnkFile,
      ').' + property + ';'
    ].join('\'');

    commands.push(command);
  }

  return commands.join('');
}

function getWindowsShortcutProperties (lnkFile) {
  lnkFile = lnkFile || '';
  if (process.platform !== 'win32') {
    return throwError('Platform is not Windows');
  }
  if (typeof(lnkFile) !== 'string' || !lnkFile.endsWith('.lnk')) {
    return throwError('Input must be a string of a file path to a .lnk file');
  }

  const normalizedFile = path.normalize(path.resolve(lnkFile));
  if (!fs.existsSync(normalizedFile)) {
    return throwError('Input must be a .lnk file that exists');
  }

  const command = 'powershell.exe -command "' + generateCommands(normalizedFile) + '"';
  try {
    const results = String(exec(command)).split('\r\n');
    const output = {};

    for (let i = 0; i < windowShortcutProperties.length; i++) {
      output[windowShortcutProperties[i]] = results[i];
    }

    return output;
  } catch (err) {
    if (err) {
      return throwError('Failed to run powershell command to get shortcut properties', err);
    }
  }
}

module.exports = getWindowsShortcutProperties;
