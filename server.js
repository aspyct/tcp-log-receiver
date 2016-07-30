var net = require('net');
var LocalEvent = require('./localevent.js');

class Server {
    constructor() {
        this.onConnection = new LocalEvent();
        this.onStarting = new LocalEvent();
        this.onStarted = new LocalEvent();
        this.onClosing = new LocalEvent();
        this.onClosed = new LocalEvent();

        this._server = net.createServer();
        this._server.on('listening', () => {
            this.onStarted.trigger(this);
        });
        this._server.on('connection', (socket) => {
            var connection = new Connection(socket);
            this.onConnection.trigger(connection, this);
        });
        this._server.on('close', () => {
            this.onClosed.trigger(this);
        });
    }

    start(host, port) {
        this.onStarting.trigger(this);
        this._server.listen(port, host);
    }

    stop() {
        this.onClosing.trigger(this);
        this._server.close();
    }
};

class Connection {
    constructor(socket) {
        this.socket = socket;
        var address = socket.address();
        this.name = address.address + ":" + address.port;
        this.logs = "";
        this.onLog = new LocalEvent();
        this.onClose = new LocalEvent();

        socket.on('data', (data) => {
            this.logs += data;
            this.onLog.trigger(data, this);
        });

        socket.on('close', () => {
            this.onClose.trigger(this);
        });
    }
};

module.exports = new Server();
