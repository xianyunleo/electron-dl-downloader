# electron-download

> Electron app simple and easy to use download manager, support for multiple downloads

## Why?

- Simple to use, few call parameters
- No electron window object is required
- Support for multiple downloads
- Support timeout
- Perfect compatibility with electron api

## Install

```sh
npm i electron-download
```

*Requires Electron 22 or later.*

## Usage

```js
const ElectronDownload = require('electron-download');

const dl = new ElectronDownload('https://xx.exe', 'D:\\oo.exe');

try {
    const item = await dl.download()
    const state = await dl.whenDone()
} catch (e) {
    console.log(e)
}

if (state === ElectronDownload.STATES.completed) {
    console.log('Download successfully')
} else {
    console.log(`Download failed: ${state}`)
}

//Electron DownloadItem events and methods are also supported

item.on('updated', (event, state) => {
    if (state === ElectronDownload.STATES.interrupted) {
        console.log('Download is interrupted but can be resumed')
    } else if (state === ElectronDownload.STATES.progressing) {
        if (item.isPaused()) {
            console.log('Download is paused')
        } else {
            console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
    }
})

item.pause();
```


## API

It can only be used in the [main](https://electronjs.org/docs/glossary/#main-process) process.

## Class: `ElectronDownload`


#### `constructor()`

``` typescript
constructor(url: string, savePath:string ,options:object)
//options optional
{
    headers, //Electron downloadURL options headers
    timeout  //second，default 30
}
```

### Instance Methods

#### `download()`
Starts a file download. Returns the `DownloadItem` of the download.
```typescript
download(): Promise<DownloadItem>
```

#### `whenDone()`
Wait for the "done" event for DownloadItem and returns state `string`
```typescript
whenDone(): Promise<string>
```

### Instance Properties

#### `url` 
Returns arg url

#### `filePath`
Returns arg filePath

### Static Properties

#### `STATES`
Returns downloadItem state `object`