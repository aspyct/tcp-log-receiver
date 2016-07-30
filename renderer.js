var net = require('net');
var server = net.createServer();
var LocalEvent = require('./localevent.js');
var settings = require('./settings.js');

var logContainer = document.getElementById('log-container');
var selectedConnection = null;

class ConnectionList {
  constructor() {
    this._connections = [];
    this.onNewConnection = new LocalEvent();
  }

  addConnection(connection) {
    this._connections.push(connection);
    this.onNewConnection.trigger(this, connection);
  }
}

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
      this.onLog.trigger(this, data);
    });

    socket.on('close', () => {
      this.onClose.trigger(this);
    });
  }
};

var connectionList = new ConnectionList();

var firstConnectionListener = connectionList.onNewConnection.listen((_, conn) => {
  // Run this only for the first connection
  firstConnectionListener.unregister();

  // Remove the "no connection" label
  document.getElementById('no-connection-yet').style.display = 'none';

  // And open the first connection
  openConnection(conn);
});

connectionList.onNewConnection.listen((_, connection) => {
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

server.on('connection', function(socket) {
  var connection = new Connection(socket);
  connectionList.addConnection(connection);
});

var logListener = LocalEvent.NullListener;
function openConnection(connection) {
  logListener.unregister();
  logListener = connection.onLog.listen(updateLogContainer);

  logContainer.innerText = connection.logs;
}

function updateLogContainer(connection, message) {
  // Append new message
  logContainer.innerText += message;

  // Scroll to bottom
  logContainer.scrollTop = logContainer.scrollHeight;
}

var settingsForm = document.getElementById('toolbar');
var startButton = settingsForm.start;
var stopButton = settingsForm.stop;
var addressField = settingsForm.address;
var portField = settingsForm.port;

startButton.onclick = function() {
  this.disabled = true;
  var address = settings.serverHost;
  var port = settings.serverPort;

  server.listen(port, address);
};

stopButton.onclick = function() {
  this.disabled = true;
  server.close();
};

server.on('listening', function() {
  stopButton.disabled = false;
  stopButton.style.display = 'initial';
  startButton.style.display = 'none';
});

server.on('close', function() {
  startButton.disabled = false;
  startButton.style.display = 'initial';
  stopButton.style.display = 'none';
});

settingsForm.stop.style.display = 'none';

// vim: et ts=2 sw=2:
