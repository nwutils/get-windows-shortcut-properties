/**
 * @file    Entry point for the library. Exposes the external facing function that accepts the input defined in the API documentation.
 * @author  TheJaredWilcurt
 */
'use strict';

const exec = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const parseRawData = require('./src/parse-raw-data.js');

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
 * A generic function for errors/warnings. It will either call the passed in customLoger,
 * or use console.error to notify the user of this library of errors or validation warnings.
 *
 * @param  {CUSTOMLOGGER} customLogger  User provided function to handle logging human readable errors/warnings
 * @param  {string}       message       A human readable message describing an error/warning
 * @param  {any}          error         A programmatic error message or object, may be undefined
 */
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

/**
 * Generic type validation function. Ensures value passed in is an array
 * that contains at least one string, and only strings.
 *
 * @param  {any}     arr  A value to be validated as an array of strings
 * @return {boolean}      true = valid
 */
function isArrayOfStrings (arr) {
  let isValidArray = false;
  if (Array.isArray(arr) && arr.length) {
    isValidArray = arr.every(function (item) {
      return typeof(item) === 'string';
    });
  }
  return isValidArray;
}

/**
 * Generic type validation function. Ensures value passed in is an array
 * that contains at least one object, and only objects.
 *
 * @param  {any}     arr  A value to be validated as an array of objects
 * @return {boolean}      true = valid
 */
function isArrayOfObjects (arr) {
  let isValidArray = false;
  if (Array.isArray(arr) && arr.length) {
    isValidArray = arr.every(function (item) {
      return !Array.isArray(item) && typeof(item) === 'object';
    });
  }
  return isValidArray;
}

/**
 * If a customLogger is passed in, ensures it is a valid function.
 *
 * @param  {CUSTOMLOGGER} customLogger  User provided function to handle logging human readable errors/warnings
 * @return {boolean}                    True if valid, false if invalid
 */
function customLoggerIsValid (customLogger) {
  if (customLogger && typeof(customLogger) !== 'function') {
    throwError(customLogger, 'The customLogger must be a function or undefined');
    return false;
  }
  return true;
}

/**
 * Validates that shortcutProperties and customLogger are the correct expected types.
 *
 * @param  {SHORTCUTPROPERITES[]} shortcutProperties  Array of objects, each representing a successful or failed shortcut property
 * @param  {CUSTOMLOGGER}         customLogger        User provided function to handle logging human readable errors/warnings
 * @return {boolean}                                  True if valid, false if invalid
 */
function translateInputsAreValid (shortcutProperties, customLogger) {
  let valid = true;
  valid = customLoggerIsValid(customLogger);
  if (!isArrayOfObjects(shortcutProperties)) {
    throwError(customLogger, 'The shortcutProperties must be an array of objects');
    valid = false;
  }
  return valid;
}

/**
 * Validates that the filePath and customLogger are the correct expected types.
 * Validates that this Windows specific library is actually being ran on Windows.
 *
 * @param  {(string|string[])} filePath      String or array of strings for the filepaths to shortcut files
 * @param  {CUSTOMLOGGER}      customLogger  User provided function to handle logging human readable errors/warnings
 * @return {boolean}                         True if valid, false if invalid
 */
function syncInputsAreValid (filePath, customLogger) {
  let valid = true;
  valid = customLoggerIsValid(customLogger);
  if (process.platform !== 'win32') {
    throwError(customLogger, 'Platform is not Windows');
    valid = false;
  }

  if (
    !filePath ||
    (
      Array.isArray(filePath) &&
      !isArrayOfStrings(filePath)
    ) ||
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

/**
 * Normalizes a file path and ensures it exists and ends with .lnk or .url.
 * Warns and returns false if filePath does not meet these requirements.
 *
 * @param  {string}       filePath      Path to a .lnk or .url Windows shortcut file
 * @param  {CUSTOMLOGGER} customLogger  User provided function to handle logging human readable errors/warnings
 * @return {string}                     The normalized full path to a Windows shortcut that is known to exist
 */
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
 * Creates strings of PowerShell commands for each filePath to get the file properties.
 * Stores strings in a returned Array.
 *
 * @param  {string[]}     filePaths     Array of strings for the filepaths to shortcut files
 * @param  {CUSTOMLOGGER} customLogger  Optional function to handle logging human readable errors/warnings
 * @return {string[]}                   Array of strings of PowerShell commands to get shortcut properties
 */
function generateCommands (filePaths, customLogger) {
  const commands = [];

  for (let filePath of filePaths) {
    const normalizedFile = normalizeFile(filePath, customLogger);
    if (normalizedFile) {
      // Escape (') and (’) in the file path for PowerShell syntax
      const safeFilePath = normalizedFile
        .replace(/'/g, '\'\'')
        .replace(/’/g, '’’');

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

module.exports = {
  /**
   * Retrieves the details of OS based Windows shortcuts.
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
  sync: function (filePath, customLogger) {
    if (!syncInputsAreValid(filePath, customLogger)) {
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
  },
  /**
   * Translates the official Microsoft shortcut property names to something more human readable and familiar to JavaScript developers.
   *
   * @param  {SHORTCUTPROPERITES[]} shortcutProperties  Array of objects, each representing a successful or failed shortcut property
   * @param  {CUSTOMLOGGER}         customLogger        User provided function to handle logging human readable errors/warnings
   * @return {boolean}                                  True if valid, false if invalid
   */
  translate: function (shortcutProperties, customLogger) {
    if (!translateInputsAreValid(shortcutProperties, customLogger)) {
      return;
    }
    const windowModes = {
      1: 'normal',
      3: 'maximized',
      7: 'minimized'
    };
    const translatedProperties = shortcutProperties.map(function (shortcut) {
      const translatedShortcut = {
        // 'C:\\Users\\Owner\\Desktop\\DaVinci Resolve.lnk',
        filePath: shortcut.FullName || '',
        // '--foo=bar',
        arguments: shortcut.Arguments || '',
        // 'Video Editor',
        comment: shortcut.Description || '',
        // 'CTRL+SHIFT+F10',
        hotkey: shortcut.Hotkey || '',
        // 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\ResolveIcon.exe,0',
        icon: shortcut.IconLocation || '',
        // '',
        relativePath: shortcut.RelativePath || '',
        // 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe',
        targetPath: shortcut.TargetPath || '',
        // '1',
        windowMode: windowModes[shortcut.WindowStyle] || 'normal',
        // 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\',
        workingDirectory: shortcut.WorkingDirectory || ''
      };
      return translatedShortcut;
    });
    return translatedProperties;
  }
};
