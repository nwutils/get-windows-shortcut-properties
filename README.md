# get-windows-shortcut-properties

A Node.js library to get the properties of a Windows .lnk shortcut file

This library is completely **SYNCHRONOUS**.


## Install Instructions

1. Install [Node/npm](https://nodejs.org)
1. `npm install --save get-windows-shortcut-properties`


## Usage

```js
const getWindowsShortcutProperties = require('get-windows-shortcut-properties');

if (process.platform === 'win32') {
  const SublimeText = getWindowsShortcutProperties.sync('../Sublime Text.lnk');
  const Firefox = getWindowsShortcutProperties.sync('C:\\Users\\Public\\Desktop\\Firefox.lnk');
  console.log({ SublimeText, Firefox });
}
```

## Documentation


### Input

Key            | Type     | Allowed            | Required | Description
:--            | :--      | :--                | :--      | :--
`filePath`     | string   | Must end in `.lnk` | yes      | The path to the LNK file you want the properties of
`customLogger` | function | Any function       | no       | This is a function that is called with a message and error object, if something fails. Defaults to using `console.error`.


### Output

Returns `undefined` if there was an error, or an object like so:

```js
{
  FullName: 'C:\\Users\\Owner\\Desktop\\DaVinci Resolve.lnk',
  Arguments: '',
  Description: 'Video Editor',
  Hotkey: '',
  IconLocation: 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\ResolveIcon.exe,0',
  RelativePath: '',
  TargetPath: 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe',
  WindowStyle: '1',
  WorkingDirectory: 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\'
}
```

See [Microsoft's Shortcut Documentation](https://docs.microsoft.com/en-us/troubleshoot/windows-client/admin-development/create-desktop-shortcut-with-wsh) for information on these keys and their values.


* * *


## OS Support

Only works on Windows OS's that has Powershell installed.


* * *


## Credits

Author: The Jared Wilcurt

This repo was inspired by:

* https://github.com/felixrieseberg/windows-shortcuts-ps


* * *


## How can you help improve this repo?

* Report bugs in the GitHub issues
* Request features
* Fix reported bugs with a PR
* Offer an async and sync mode, instead of just sync.
* This repo is written using `require` for imports. It would be nice to also support ESM imports.
