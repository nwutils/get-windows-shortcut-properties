# get-windows-shortcut-properties

A Node.js library to get the properties of a Windows .lnk or .url shortcut file.

This library is completely **SYNCHRONOUS**.


## Install Instructions

1. Install [Node/npm](https://nodejs.org)
1. `npm install --save get-windows-shortcut-properties`


## Usage

**Single File Example**

```js
const getWindowsShortcutProperties = require('get-windows-shortcut-properties');

if (process.platform === 'win32') {
  const output = getWindowsShortcutProperties.sync('../Sublime Text.lnk');

  if (ouput) {
    console.log(output);
  } else {
    console.log('There was an error');
  }
}
```

**Multiple Files Example**

```js
const getWindowsShortcutProperties = require('get-windows-shortcut-properties');

if (process.platform === 'win32') {
  const output = getWindowsShortcutProperties.sync([
    '../Sublime Text.lnk',
    'C:\\Users\\Public\\Desktop\\Firefox.lnk'
  ]);
  if (ouput) {
    console.log(output);
  } else {
    console.log('There was an error');
  }
}
```

**Custom Logger Single File Example**

```js
const getWindowsShortcutProperties = require('get-windows-shortcut-properties');

if (process.platform === 'win32') {
  const output = getWindowsShortcutProperties.sync('../Sublime Text.lnk', function (message, error) {
    console.log(message, error);
  });

  if (ouput) {
    console.log(output);
  } else {
    console.log('There was an error');
  }
}
```

**Custom Logger Multiple Files Example**

```js
const getWindowsShortcutProperties = require('get-windows-shortcut-properties');

if (process.platform === 'win32') {
  const shortcuts = [
    '../Sublime Text.lnk',
    'C:\\Users\\Public\\Desktop\\Firefox.lnk'
  ];
  function customLogger (message, error) {
    console.log(message, error);
  }
  const output = getWindowsShortcutProperties.sync(shortcuts, customLogger);

  if (ouput) {
    console.log(output);
  } else {
    console.log('There was an error');
  }
}
```


## Documentation


### getWindowsShortcutProperties.sync

* First argument
  * **KEY:** `filePath`
  * **TYPE:** *String or Array of Strings*
  * **DESCRIPTION:** The path to the shortcut file you want the properties of, or an array of strings to multiple files
  * **REQUIREMENTS:** Strings must point to a file that exists and ends in `.lnk` or `.url`
  * **PERFORMANCE:** Passing in an array of files is significantly faster than running this library once for every file. Each run has a ~0.25s overhead cost of spinning up PowerShell. So we group all your files into one request and they run together. (meaning 100 individual runs = 25 seconds versus one run with 100 files passed in = 0.4s).
  * **WARNING:** Passing in **too many** files at once will produce a PowerShell command that is too long to run. For me it worked with 92 files and no more. But it's all about the total command length produced by this library. So longer file paths will mean fewer files can be passed in at once. Relative paths are normalized by Node, so using them will not help or hurt.
* Second argument
  * **KEY:** `customLogger`
  * **TYPE:** *function*
  * **DESCRIPTION:** This is an **optional** function that is called with a message and error object (if something fails, or you pass in bad inputs). Defaults to using `console.error` if not passed in.


### Output

Returns `undefined` if there was an error, or an Array of Objects for each successful file:

```js
[
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
]
```

See [Microsoft's Shortcut Documentation](https://docs.microsoft.com/en-us/troubleshoot/windows-client/admin-development/create-desktop-shortcut-with-wsh) for information on these keys and their values.


If you pass in an array of files, and some succeed, you will get an array of the success and console errors for the other files (unless you pass in a `customLogger` function, in which case it gets called when errors occur).


* * *


## OS Support

Only works on Windows OS's that has PowerShell installed.


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


* * *


## Related Libraries:

* [create-desktop-shortcuts](https://github.com/nwutils/create-desktop-shortcuts)
