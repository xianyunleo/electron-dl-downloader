# electron-dl-downloader

> Electron app simple and easy to use download manager, support for multiple downloads

## Why?

- Simple to use, few call parameters
- No electron window object is required
- Support for multiple downloads
- Support timeout
- Perfect compatibility with electron api

## Install

```sh
npm i electron-dl-downloader
```

*Requires Electron 22 or later.*

## Usage

```js
const Downloader = require('electron-dl-downloader');
const dl = new Downloader('https://xx.exe', 'D:\\oo.exe');
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
Electron DownloadItem events and methods are also supported.https://www.electronjs.org/docs/latest/api/download-item
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