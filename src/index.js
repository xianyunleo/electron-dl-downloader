const {session} = require('electron');

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
const ElectronDownload = class ElectronDownload {
    _filePath = "";
    _options = {};
    static  _filePathMap = new Map();
    static  _downloadItemMap = new Map();
    static  _initVal = false;

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
        this._url = url;
        this._filePath = filePath;
        this._options = options ?? {};
    }

    static _init() {
        if (ElectronDownload._initVal) return; //只监听一次，不和用户自己的will-download冲突
        ElectronDownload._initVal = true;
        session.defaultSession.on("will-download", (event, item) => {
            const itemUrl = item.getURLChain()[0];
            item.setSavePath(ElectronDownload._filePathMap.get(itemUrl));
            ElectronDownload._downloadItemMap.set(itemUrl, item);
        });
    }

    /**
     * Returns electron DownloadItem
     * @returns {Promise<DownloadItem>}
     */
    async download() {
        ElectronDownload._init();
        ElectronDownload._filePathMap.set(this._url, this._filePath);
        const opts = this._options.headers ? {headers: this._options.headers} : {};
        session.defaultSession.downloadURL(this._url, opts);
        return await this._getDownloadItem();
    }

    async _getDownloadItem() {
        this._options.timeout = this._options.timeout ?? 30; //second
        const times = this._options.timeout * 10;
        for (let i = 0; i < times; i++) {
            const item = ElectronDownload._downloadItemMap.get(this._url);
            if (item && item.getReceivedBytes() > 0) {
                return item;
            }
            await sleep(100);
        }
        throw new Error(`Download timeout: ${this._url}`);
    }

    /**
     * Wait for the "done" event for DownloadItem and returns state
     * @returns {Promise<string>}
     */
    async whenDone() {
        const item = ElectronDownload._downloadItemMap.get(this._url);
        return new Promise((resolve, reject) => {
            item.once("done", (event, state) => {
                resolve(state);
            });
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

module.exports = ElectronDownload;