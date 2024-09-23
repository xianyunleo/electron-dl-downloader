const {session} = require('electron');
const events = require('events');

const Downloader = class Downloader {
    _url = "";
    _filePath = "";
    _options = {};
    _downloadItem;
    static _initVal = false;
    static _filePathMap = new Map();
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

    constructor(url, filePath, options = {}) {
        this._url = encodeURI(url);
        this._filePath = filePath;
        this._options = options ?? {};
    }

    static _init() {
        if (Downloader._initVal) return; //只监听一次，不和用户自己的will-download冲突
        Downloader._initVal = true;
        session.defaultSession.on("will-download", (event, item) => {
            const itemUrl = item.getURLChain()[0];
            Downloader._eventEmitter.emit(itemUrl, item);
            item.setSavePath(Downloader._filePathMap.get(itemUrl));
        });
    }

    /**
     * Returns electron DownloadItem
     * @returns {Promise<DownloadItem>}
     */
    async download() {
        Downloader._filePathMap.set(this._url, this._filePath);
        Downloader._init();
        const opts = this._options.headers ? {headers: this._options.headers} : {};
        session.defaultSession.downloadURL(this._url, opts);
        return await this._getDownloadItem();
    }

    async _getDownloadItem() {
        return new Promise(async (resolve, reject) => {
            this._options.timeout = this._options.timeout ?? 60; //second
            const timeout = this._options.timeout * 1000;
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