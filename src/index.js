const {app, session} = require('electron');
const events = require('events');
const path = require('path');

const Downloader = class Downloader {
    _params = {}
    _url = "";
    _filePath = "";
    _dir = "";
    _fileName = "";
    _downloadItem;
    static _initVal = false;
    static _filePathMap = new Map();
    static _dirMap = new Map();
    static _fileNameMap = new Map();
    static _eventEmitter = new events.EventEmitter();

    /**
     * Electron downloadItem state object
     * @returns {object}
     */
    static STATES = {
        progressing: "progressing",
        completed: "completed",
        cancelled: "cancelled",
        interrupted: "interrupted"
    };

    constructor(params) {
        this._params = params
        this._url = encodeURI(params.url);
        if(params.filePath){
            this._filePath = params.filePath;
        }else{
            this._dir = params.directory ?? app.getPath('downloads');
            this._fileName = params.fileName;
        }
    }

    static _init() {
        if (Downloader._initVal) return; //只监听一次，不和用户自己的will-download冲突
        Downloader._initVal = true;
        session.defaultSession.on("will-download", (event, item) => {
            const itemUrl = item.getURLChain()[0];
            Downloader._eventEmitter.emit(itemUrl, item);
            let savePath = Downloader._filePathMap.get(itemUrl)
            if (!savePath) {
                let fileName = Downloader._fileNameMap.get(itemUrl)
                console.log('fileName',fileName)
                fileName = fileName ? fileName : item.getFilename();
                savePath = path.join(Downloader._dirMap.get(itemUrl), fileName)
            }
            item.setSavePath(savePath);
        });
    }

    /**
     * Returns electron DownloadItem
     * @returns {Promise<DownloadItem>}
     */
    async download() {
        Downloader._filePathMap.set(this._url, this._filePath);
        Downloader._dirMap.set(this._url, this._dir);
        Downloader._fileNameMap.set(this._url, this._fileName);
        Downloader._init();
        session.defaultSession.downloadURL(this._url, this._params.options);
        return await this._getDownloadItem();
    }

    async _getDownloadItem() {
        return new Promise(async (resolve, reject) => {
            this._params.timeout = this._params.timeout ?? 60; //second
            const timeout = this._params.timeout * 1000;
            const timeoutId = setTimeout(() => {
                Downloader._eventEmitter.off(this._url, callback)
                reject(`Download timeout: ${this._url}`);
            }, timeout);

            const callback = (downloadItem) => {
                resolve(downloadItem);
                this._downloadItem = downloadItem;
                clearTimeout(timeoutId);
            }
            Downloader._eventEmitter.once(this._url, callback);
        });

    }

    /**
     * Wait for the "done" event for DownloadItem and returns state
     * @returns {Promise<string>}
     */
    async whenDone() {
        const item = this._downloadItem;
        return new Promise((resolve, reject) => {
            if (item.isDone()) {  //see console.log(item)
                resolve(item.getState());
            } else {
                item.once("done", (event, state) => {
                    resolve(state);
                });
            }
        });
    }

    /**
     * Returns arg url
     */
    get url() {
        return this._url;
    }

    /**
     * Returns arg filepath
     */
    get filePath() {
        return this._filePath;
    }
}

module.exports = Downloader;