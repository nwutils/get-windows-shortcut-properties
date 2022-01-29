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

function generateCommand (filePath) {
  const command = [
    '(New-Object -COM WScript.Shell).CreateShortcut(',
    filePath,
    ');'
  ].join('\'');

  return command;
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
    typeof(filePath) !== 'string' ||
    (
      !filePath.endsWith('.lnk') &&
      !filePath.endsWith('.url')
    )
  ) {
    throwError(customLogger, 'Input must be a string of a file path to a .lnk or .url file');
    valid = false;
  }
  return valid;
}

function normalizeFile (filePath, customLogger) {
  const normalizedFile = path.normalize(path.resolve(filePath));
  if (!fs.existsSync(normalizedFile)) {
    throwError(customLogger, 'Input must be a .lnk or .url file that exists');
    return false;
  }
  return normalizedFile;
}

function getWindowsShortcutProperties (filePath, customLogger) {
  if (!inputsAreValid(filePath, customLogger)) {
    return;
  }

  const normalizedFile = normalizeFile(filePath, customLogger);
  if (!normalizedFile) {
    return;
  }

  const command = 'powershell.exe -command "' + generateCommand(normalizedFile) + '"';
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
