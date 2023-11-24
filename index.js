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

function generateCommands (filePaths, customLogger) {
  const commands = [];

  for (let filePath of filePaths) {
    const normalizedFile = normalizeFile(filePath, customLogger);
    if (normalizedFile) {
      // Escape (') and (’) in the file path for PowerShell syntax
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
 * OPTIONAL: console.error is called by default.
 *
 * Your own custom logging function called with helpful warning/error
 * messages from the internal validators.
 *
 * @typedef  {Function} CUSTOMLOGGER
 * @callback {Function} CUSTOMLOGGER
 * @param    {string}   message       The human readable warning/error message
 * @param    {object}   [error]       Sometimes an error or options object is passed
 * @return   {void}
 */

/**
 * @typedef  {object} SHORTCUTPROPERITES
 * @property {string} FullName            'C:\\Users\\Owner\\Desktop\\DaVinci Resolve.lnk'
 * @property {string} Arguments           '--foo=bar'
 * @property {string} Description         'Video Editor'
 * @property {string} Hotkey              'CTRL+SHIFT+F10'
 * @property {string} IconLocation        'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\ResolveIcon.exe,0'
 * @property {string} RelativePath        ''
 * @property {string} TargetPath          'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe'
 * @property {string} WindowStyle         '1'
 * @property {string} WorkingDirectory    'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\'
 */

/**
 * Retrieves the details of OS based shortcuts.
 *
 * @example
 * const output = getWindowsShortcutProperties.sync([
 *   '../Sublime Text.lnk',
 *   'C:\\Users\\Public\\Desktop\\Firefox.lnk'
 * ]);
 *
 * @param  {(string|string[])}    filePath      String or array of strings for the filepaths to shortcut files
 * @param  {CUSTOMLOGGER}         customLogger  Optional function to handle logging human readable errors/warnings
 * @return {SHORTCUTPROPERITES[]}               Array of objects or undefined, each representing a successful or failed shortcut property
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
