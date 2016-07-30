let initialHost = "127.0.0.1";
let initialPort = 1911;

let hostKey = 'host';
let portKey = 'port';

class Settings {
    get serverHost() {
        return localStorage.getItem(hostKey) || initialHost;
    }

    set serverHost(value) {
        localStorage.setItem(hostKey, value);
    }

    get serverPort() {
        return localStorage.getItem(portKey) || initialPort;
    }

    set serverPort(value) {
        localStorage.setItem(portKey, value);
    }
};

module.exports = new Settings();
