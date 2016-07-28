var net = require('net');
var server = net.createServer();

class LocalEvent {
  constructor() {
    this.listeners = [];
  }

  listen(listener) {
    this.listeners.push(listener);
  }

  unlisten(listener) {
    var pos = this.listeners.indexOf(listener);
    if (pos > -1) {
      this.listeners.splice(pos, 1);
    }
  }

  trigger() {
    for (var i = 0; i < this.listeners.length; ++i) {
      var listener = this.listeners[i];
      listener.apply(listener, arguments);
    }
  }
}

// Register action for Settings button
document.getElementById('settings-button').onclick = () => {
  window.open('settings.html');
};

var connectionList = document.getElementById('connection-list');
var logContainer = document.getElementById('log-container');
var noConnectionLabel = document.getElementById('no-connection-yet');
var selectedConnection = null;

class Connection {
  constructor(socket) {
    this.socket = socket;
    var address = socket.address();
    this.name = address.address + ":" + address.port;
    this.logs = "";
    this.onLog = new LocalEvent();
    this.onClose = new LocalEvent();

    var self 
    socket.on('data', (data) => {
      this.logs += data;
      this.onLog.trigger(this, data);
    });

    socket.on('close', () => {
      this.onClose.trigger(this);
    });
  }
};

server.on('connection', function(socket) {
  // Remove the "no connection" label
  noConnectionLabel.style.display = 'none';
  
  var connection = new Connection(socket);

  // Create and add the list entry for this connection
  var listEntry = (function() {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.innerText = connection.name;
      a.onclick = function() {
        li.classList.remove('unread');
        openConnection(connection);
      };

      li.appendChild(a);
      connectionList.appendChild(li);

      // Show whether the connection is dead or alive
      li.classList.add('live');
      connection.onClose.listen(() => {
        li.classList.remove('live');
        li.classList.add('dead');
      });
      connection.onLog.listen(() => {
        li.classList.add('unread');
      });

      return li;
  }());
});

function openConnection(connection) {
  if (selectedConnection != null) {
    selectedConnection.onLog.unlisten(updateLogContainer);
  }

  selectedConnection = connection;
  connection.onLog.listen(updateLogContainer);
  logContainer.innerText = connection.logs;
}

function updateLogContainer(connection, message) {
  logContainer.innerText += message;
}

var settingsForm = document.getElementById('server-settings');
var startButton = settingsForm.start;
var stopButton = settingsForm.stop;
var addressField = settingsForm.address;
var portField = settingsForm.port;

startButton.onclick = function() {
  this.disabled = true;
  var address = addressField.value;
  var port = parseInt(portField.value);

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
