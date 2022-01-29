# get-windows-shortcut-properties

A Node.js library to get the properties of a Windows .lnk shortcut file


## Install Instructions

1. Install [Node/npm](https://nodejs.org)
1. `npm install --save get-windows-shortcut-properties`


## Usage

```js
const getWindowsShortcutProperties = require('get-windows-shortcut-properties');

if (process.platform === 'win32') {
  const Discord = getWindowsShortcutProperties('../Sublime Text.lnk');
  const Firefox = getWindowsShortcutProperties('C:\\Users\\Public\\Desktop\\Firefox.lnk');
  console.log({ Discord, Firefox });
}
```

## Documentation


### Input

Key        | Type   | Allowed            | Required | Description
:--        | :--    | :--                | :--      | :--
`filePath` | string | Must end in `.lnk` | yes      | The path to the LNK file you want the properties of


### Output

Returns an object like so:

```js
{
  TargetPath: 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe',
  Arguments: '',
  Description: '',
  WorkingDirectory: 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\',
  IconLocation: 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\ResolveIcon.exe,0',
  WindowStyle: '1',
  Hotkey: ''
}
```


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
