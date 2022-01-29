const getWindowsShortcutProperties = require('./index.js');

const timeLabel = 'Executed in';
console.time(timeLabel);

if (process.platform === 'win32') {
  const Firefox = getWindowsShortcutProperties('C:\\Users\\Public\\Desktop\\Firefox.lnk');
  const WinAMP = getWindowsShortcutProperties('C:\\Users\\Public\\Desktop\\Winamp.lnk');
  const GitAhead = getWindowsShortcutProperties('C:\\Users\\Owner\\Desktop\\GitAhead.lnk');
  const DaVinci = getWindowsShortcutProperties('C:\\Users\\Owner\\Desktop\\DaVinci Resolve.lnk');
  console.log({
    DaVinci,
    Firefox,
    GitAhead,
    WinAMP
  });
}

console.timeEnd(timeLabel);
