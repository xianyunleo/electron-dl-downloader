# electron-dl-downloader

> Electron app simple and easy to use download manager, support for multiple downloads

## Why?

- Simple to use, few call parameters
- No electron window object is required
- Support for multiple downloads (Associate by url)
- Support timeout
- Perfect compatibility with electron api

## Install

```sh
npm i electron-dl-downloader
```

## Usage

```js
const Downloader = require('electron-dl-downloader');
const dl = new Downloader({url:'https://xx.exe', filePath:'D:\\Downloads\\oo.exe'});
//const dl = new Downloader({url:'https://xx.exe', directory:'D:\\Downloads'});
//const dl = new Downloader({url:'https://xx.exe', directory:'D:\\Downloads', fileName:'oo.exe'});
```

```js
const item = await dl.download()
const state = await dl.whenDone()

if (state === Downloader.STATES.completed) {
    console.log('Download successfully')
} else {
    console.log(`Download failed: ${state}`)
}
```
Electron DownloadItem events and methods are also supported.\
https://www.electronjs.org/docs/latest/api/download-item
```js

const item = await dl.download()

item.on('updated', (event, state) => {
    if (state === Downloader.STATES.interrupted) {
        console.log('Download is interrupted but can be resumed')
    } else if (state === Downloader.STATES.progressing) {
        if (item.isPaused()) {
            console.log('Download is paused')
        } else {
            console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
    }
})

item.pause()
```

## API

It can only be used in the [main](https://electronjs.org/docs/glossary/#main-process) process.

## Class: `Downloader`


#### `constructor()`

```
constructor(params)

params: {
    url: string,
    filePath: string, //such as "D:\\Downloads\\oo.exe"
    directory: string, //such as "D:\\Downloads". default:Directory for a user's downloads.
    fileName: string, //such as "oo.exe". default:Electron downloadItem.getFilename()
    timeout: number,  //second. default 60
    options: object //Electron downloadURL options
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