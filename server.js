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
            /* Create a new Connection object and notify listeners */
            var connection = new Connection(socket, this.onClosing);
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
    constructor(socket, onServerClosing) {
        this.socket = socket;
        var address = socket.address();
        this.name = address.address + ":" + address.port;
        this.logs = "";
        this.onLog = new LocalEvent();
        this.onClose = new LocalEvent();

        /* We must close the socket when the server requests it */
        var terminator = onServerClosing.listen(() => {
            socket.end();
        });

        /* Keep the socket alive as long as possible */
        socket.setKeepAlive(true);

        // Make sure to receive utf8-decoded string
        socket.setEncoding('utf8');

        socket.on('data', (data) => {
            this.logs += data;
            this.onLog.trigger(data, this);
        });

        socket.on('close', () => {
            this.onClose.trigger(this);
            terminator.unregister();
        });

        socket.on('end', () => {
            /* Other side attempts to close the socket */
            socket.end();
        });
    }

    toString() {
        return this.name;
    }
};

module.exports = new Server();
