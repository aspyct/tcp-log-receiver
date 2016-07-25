// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var net = require('net');

var server = net.createServer();

(function(server) {
  var connectionList = document.getElementById('connection-list');
  var logContainer = document.getElementById('log-container');
  var noConnectionLabel = document.getElementById('no-connection-yet');
  var selectedConnection = null;

  var Connection = function (socket) {
    this.socket = socket;

    var address = socket.address();
    this.name = address.address + ":" + address.port;
    this.logs = "";
    
    return this;
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
          openConnection(connection);
        };

        li.appendChild(a);
        connectionList.appendChild(li);

        // Show whether the connection is dead or alive
        li.className = 'live';
        connection.socket.on('close', function() {
          li.className = 'dead';
        });

        return li;
    }());

    socket.on('data', function(data) {
      connection.logs += data;
      if (connection == selectedConnection) {
        logContainer.innerText += data;
      }
    });

    socket.on('close', function() {
      connection.live = false;
    });
  });

  function openConnection(connection) {
    selectedConnection = connection;
    logContainer.innerText = connection.logs;
  }
}(server));


(function(server) {
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
}(server));

