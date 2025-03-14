const {app, session} = require('electron');
const events = require('events');
const path = require('path');

const Downloader = class Downloader {
    _url = "";
    _downloadItem;
    static _initVal = false;
    static _paramsMap =  new Map();
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

    /**
     * @param {Object} params
     * @param {string} params.url
     * @param {string} [params.filePath]
     * @param {string} [params.directory]
     * @param {string} [params.fileName]
     * @param {Object} [params.options]
     */
    constructor(params) {
        this._params = params
        this._url = encodeURI(params.url);
        Downloader._paramsMap.set(this._url, params)
        this._init();
    }

    /**
     * Returns electron DownloadItem
     * @returns {Promise<DownloadItem>}
     */
    async download() {
        session.defaultSession.downloadURL(this._url, this._params.options);
        return await this._getDownloadItem();
    }

    _init() {
        if (Downloader._initVal) return; //只监听一次
        Downloader._initVal = true;
        session.defaultSession.on("will-download", (event, item) => {
            const itemUrl = item.getURLChain()[0];
            Downloader._eventEmitter.emit(itemUrl, item);
            const params = Downloader._paramsMap.get(itemUrl)
            if (!params) {
                throw new Error('Url Mismatch.\n' + itemUrl)
            }
            let savePath = params.filePath
            if (!savePath) {
                const fileName = params.fileName ?? item.getFilename();
                const dir = params.directory ?? app.getPath('downloads');
                savePath = path.join(dir, fileName)
            }
            item.setSavePath(savePath);
        });
    }

    async _getDownloadItem() {
        return new Promise(async (resolve, reject) => {
            const callback = (downloadItem) => {
                resolve(downloadItem);
                this._downloadItem = downloadItem;
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
        return (Downloader._paramsMap.get(this._url)).filePath
    }
}

module.exports = Downloader;