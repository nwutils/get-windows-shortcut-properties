const getWindowsShortcutProperties = require('./index.js');

const timeLabel = 'Executed in';
console.time(timeLabel);

if (process.platform === 'win32') {
  const output = getWindowsShortcutProperties.sync([
    'C:\\Users\\Public\\Desktop\\Firefox.lnk',
    'C:\\Users\\Public\\Desktop\\Winamp.lnk',
    'C:\\Users\\Owner\\Desktop\\GitAhead.lnk',
    'C:\\Users\\Owner\\Desktop\\DaVinci Resolve.lnk'
  ]);
  console.log(getWindowsShortcutProperties.translate(output));
}

console.timeEnd(timeLabel);
