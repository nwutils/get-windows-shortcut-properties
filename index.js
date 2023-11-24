/**
 * @file    Entry point for the library. Exposes the external facing function that accepts the input defined in the API documentation.
 * @author  TheJaredWilcurt
 */
'use strict';

const exec = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const parseRawData = require('./src/parse-raw-data.js');

function throwError (customLogger, message, error) {
  if (typeof(customLogger) === 'function') {
    customLogger(message, error);
  } else {
    console.error(
      '________________________________\n' +
      'Get-Windows-Shortcut-Properties:\n' +
      message,
      error
    );
  }
}

function generateCommands(filePaths, customLogger) {
  const commands = [];

  for (let filePath of filePaths) {
    const normalizedFile = normalizeFile(filePath, customLogger);
    if (normalizedFile) {
      // Escape single quotes and right single quoation marks(’) in the file path
      const safeFilePath = normalizedFile
        .replace(/'/g, "''")
        .replace(/’/g, "’’");
        
      const command = [
        '(New-Object -COM WScript.Shell).CreateShortcut(\'',
        safeFilePath,
        '\');'
      ].join('');
      commands.push(command);
    }
  }

  return commands;
}

function inputsAreValid (filePath, customLogger) {
  let valid = true;
  if (customLogger && typeof(customLogger) !== 'function') {
    throwError(customLogger, 'The customLogger must be a function or undefined');
    valid = false;
  }
  if (process.platform !== 'win32') {
    throwError(customLogger, 'Platform is not Windows');
    valid = false;
  }
  if (
    !filePath ||
    (
      !Array.isArray(filePath) &&
      typeof(filePath) !== 'string'
    )
  ) {
    throwError(customLogger, 'First argument must be a String or Array of strings');
    valid = false;
  }
  return valid;
}

function normalizeFile (filePath, customLogger) {
  const normalizedFile = path.normalize(path.resolve(filePath));
  if (
    !filePath ||
    typeof(filePath) !== 'string' ||
    (
      !filePath.endsWith('.lnk') &&
      !filePath.endsWith('.url')
    ) ||
    !fs.existsSync(normalizedFile)
  ) {
    throwError(customLogger, 'File path must point to a .lnk or .url file that exists');
    return false;
  }
  return normalizedFile;
}

/**
 * @callback customLoggerCallback
 * @param {string} message
 * @param {Error} error
 * 
 * @typedef {{
 *  FullName: string,
 * 	Arguments: string,
 * 	Description: string,
 *  Hotkey: string,
 *  IconLocation: string,
 *  RelativePath: string,
 *  TargetPath: string,
 *  WindowStyle: string,
 *  WorkingDirectory: string
 * }[]} shortcutProperties
 */

/**
 * @param {string} filePath 
 * @param {customLoggerCallback} customLogger 
 * @returns {shortcutProperties}
 */
function getWindowsShortcutProperties (filePath, customLogger) {
  if (!inputsAreValid(filePath, customLogger)) {
    return;
  }
  if (typeof(filePath) === 'string') {
    filePath = [filePath];
  }

  const commands = generateCommands(filePath, customLogger).join('');
  if (!commands || !commands.length) {
    return;
  }
  const command = 'powershell.exe -command "' + commands + '"';
  try {
    const rawData = exec(command);
    const parsed = parseRawData(rawData);
    return parsed;
  } catch (err) {
    if (err) {
      throwError(customLogger, 'Failed to run powershell command to get shortcut properties', err);
      return;
    }
  }
}

module.exports = {
  sync: getWindowsShortcutProperties
};
