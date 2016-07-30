var LocalEvent = require('./localevent.js');
var settings = require('./settings.js');
var server = require('./server.js');
var Select = require('./select.js');


/*
 * Connection list and log container
 */
(function() {
    var select = new Select(document.getElementById('connection-list'));
    var logContainer = document.getElementById('log-container');

    var firstConnectionListener = server.onConnection.listen((conn) => { 
        // Run this only for the first connection
        firstConnectionListener.unregister();

        // Open the first connection
        openConnection(conn);
    });

    select.onSelect.listen((conn) => {
        openConnection(conn);
    });

    server.onConnection.listen((conn) => {
        select.add(conn);
    });

    var logListener = LocalEvent.NullListener;
    function openConnection(connection) {
        logListener.unregister();
        logListener = connection.onLog.listen(updateLogContainer);

        logContainer.innerText = connection.logs;
    }

    function updateLogContainer(message) {
        // Append new message
        logContainer.innerText += message;

        // Scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}());

(function() {
    /* Idle server form */
    var form = document.forms.serverIdle;

    form.host.value = settings.serverHost;
    form.port.value = settings.serverPort;

    form.startButton.onclick = () => {
        /* Read settings from form */
        var host = form.host.value;
        var port = parseInt(form.port.value);

        /* Save settings for later */
        settings.serverHost = host;
        settings.serverPort = port;

        /* And start server */
        server.start(host, port);
    };
}());

(function() { /* Running server form */
    var form = document.forms.serverRunning;

    form.stopButton.onclick = () => {
        server.stop();
    };
}());

(function() { /* Manage settings panel appearance */
    var panel = document.getElementById('settings-panel');

    server.onStarting.listen(() => panel.className = 'busy');
    server.onStarted.listen(() => panel.className = 'started');
    server.onClosing.listen(() => panel.className = 'busy');
    server.onClosed.listen(() => panel.className = 'idle');
}());
