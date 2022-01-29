const getWindowsShortcutProperties = require('./index.js');

const timeLabel = 'Executed in';
console.time(timeLabel);

if (process.platform === 'win32') {
  const Firefox = getWindowsShortcutProperties.sync('C:\\Users\\Public\\Desktop\\Firefox.lnk');
  const WinAMP = getWindowsShortcutProperties.sync('C:\\Users\\Public\\Desktop\\Winamp.lnk');
  const GitAhead = getWindowsShortcutProperties.sync('C:\\Users\\Owner\\Desktop\\GitAhead.lnk');
  const DaVinci = getWindowsShortcutProperties.sync('C:\\Users\\Owner\\Desktop\\DaVinci Resolve.lnk');
  console.log({
    DaVinci,
    Firefox,
    GitAhead,
    WinAMP
  });
}

console.timeEnd(timeLabel);
