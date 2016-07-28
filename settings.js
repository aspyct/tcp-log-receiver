let initialHost = "127.0.0.1";
let initialPort = 1911;

let hostKey = 'host';
let portKey = 'port';
let readyKey = 'ready';

class Settings {
    constructor() {
        if (!this.ready) {
            this.serverHost = initialHost;
            this.serverPort = initialPort;
            this.ready = true;
        }
    }

    get ready() {
        return localStorage.getItem(readyKey);
    }

    set ready(value) {
        localStorage.setItem(readyKey, value);
    }

    get serverHost() {
        return localStorage.getItem(hostKey);
    }

    set serverHost(value) {
        localStorage.setItem(hostKey, value);
    }

    get serverPort() {
        return localStorage.getItem(portKey);
    }

    set serverPort(value) {
        localStorage.setItem(portKey, value);
    }
};

module.exports = new Settings();
