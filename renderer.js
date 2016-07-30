var LocalEvent = require('./localevent.js');
var settings = require('./settings.js');
var server = require('./server.js');

/* HTML nodes */
var logContainer = document.getElementById('log-container');

var firstConnectionListener = server.onConnection.listen((conn) => { 
    // Run this only for the first connection
    firstConnectionListener.unregister();

    // Remove the "no connection" label
    document.getElementById('no-connection-yet').style.display = 'none';

    // And open the first connection
    openConnection(conn);
});

server.onConnection.listen((connection) => {
    // Create and add the list entry for this connection
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.innerText = connection.name;
    a.onclick = function() {
        li.classList.remove('unread');
        openConnection(connection);
    };

    li.appendChild(a);

    // Show whether the connection is dead or alive
    li.classList.add('live');
    connection.onClose.listen(() => {
        li.classList.remove('live');
        li.classList.add('dead');
    });
    connection.onLog.listen(() => {
        li.classList.add('unread');
    });

    document.getElementById('connection-list').appendChild(li);
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


(function() {
    /* Idle server form */
    var form = document.forms.serverIdle;

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

    server.onStarting.listen(() => panel.className = 'starting');
    server.onStarted.listen(() => panel.className = 'started');
    server.onClosing.listen(() => panel.className = 'closing');
    server.onClosed.listen(() => panel.className = 'closed');
}());
