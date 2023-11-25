/**
 * @file    Parses the raw data returned from Powershell into an object
 * @author  TheJaredWilcurt
 */
'use strict';

/**
 * Sometimes long values spill over, this function fixes this. Example:
IconLocation     : C:\\Users\\Owner\\AppData\\Roaming\\Microsoft\\Installer\\{00000000-0000-0000-0000-000000000000}\\ResolveIco
                   n.exe,0
 *
 * @param  {string[]} lines  Array of strings of each line, with weird lines
 * @return {string[]}        Array of strings of each line, without weird lines
 */
function handleWeirdLines (lines) {
  const nineteenSpaces = '                   ';
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.startsWith(nineteenSpaces)) {
      let previousLine = lines[i - 1];
      line = line.replace(nineteenSpaces, '');
      lines[i - 1] = previousLine + line;
      lines[i] = '';
    }
  }
  lines = lines.filter(Boolean);
  return lines;
}

/**
 * INPUT:
 * [
 *   'FullName         : C:\\Users\\Owner\\Desktop\\DaVinci Resolve.lnk',
 *   'Arguments        : ',
 *   'Description      : ',
 *   'Hotkey           : ',
 *   'IconLocation     : C:\\Users\\Owner\\AppData\\Roaming\\Microsoft\\Installer\\{00000000-0000-0000-0000-000000000000}\\ResolveIcon.exe,0',
 *   'RelativePath     : ',
 *   'TargetPath       : C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe',
 *   'WindowStyle      : 1',
 *   'WorkingDirectory : C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\'
 * ]
 * OUTPUT:
 * {
 *   FullName: 'C:\\Users\\Owner\\Desktop\\DaVinci Resolve.lnk',
 *   Arguments: '',
 *   Description: '',
 *   Hotkey: '',
 *   IconLocation: 'C:\\Users\\Owner\\AppData\\Roaming\\Microsoft\\Installer\\{6E40D3ED-077B-45C4-90FF-222CC65C199C}\\ResolveIcon.exe,0',
 *   RelativePath: '',
 *   TargetPath: 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe',
 *   WindowStyle: '1',
 *   WorkingDirectory: 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\'
 * }
 *
 * @param  {array}  lines  An array of lines
 * @return {object}        An object of keys and values
 */
function getKeyValuePairFromLines (lines) {
  const output = {};
  for (let line of lines) {
    // 'WorkingDirectory : C:\\Program Files\\Winamp'
    // ['WorkingDirectory ', [' C', '\\Program Files\\Winamp']]
    let [key, ...value] = line.split(':');
    // 'WorkingDirectory ' => 'WorkingDirectory'
    key = key.trim();
    // [' C', '\\Program Files\\Winamp'] => 'C:\\Program Files\\Winamp'
    value = value.join(':').trim();
    output[key] = value;
  }
  return output;
}

/**
 * Takes in a raw data bitstream from the Powershell output,
 * processes it to a string, then an Array of files, then
 * each file as an array of lines, then each file as an
 * object of key/value pairs. Returns array of objects for
 * each file.
 *
 * @param  {string} rawData  Raw stream
 * @return {array}           Parsed data
 */
function parseRawData (rawData) {
  const fileIndicator = '\r\nFullName         : ';
  let files = String(rawData).split(fileIndicator);
  files = files.filter(function (file) {
    return file !== '\r\n';
  });
  files = files.map(function (file) {
    file = fileIndicator + file;
    let lines = file.split('\r\n');
    lines = handleWeirdLines(lines);
    return getKeyValuePairFromLines(lines);
  });
  return files;
}

module.exports = parseRawData;
