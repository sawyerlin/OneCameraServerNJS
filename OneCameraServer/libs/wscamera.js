var WebSocketServer = require('websocket').server;
var _ = require('underscore');

exports.server = function(server) {
	var connections = [];
	var wsServer = new WebSocketServer({
		httpServer: server,
		autoAcceptConnections: false,
		maxReceivedFrameSize: '1MiB',
		maxReceivedMessageSize: '5MiB'
	});

	function broadCast(data) {
		var receivers = _.where(connections, {resource: '/receive'});
		_.each(receivers, function (receiver) {
			receiver.sendUTF(data.utf8Data);
		});
	}

	wsServer.on('request', function(request) {
		var connection = request.accept(null, request.origin);
		connection.resource = request.resource;
		connections.push(connection);
		_.each(connections, function(con) {console.log((new Date()) + ' ' + con.remoteAddress + ' Connected: ' + con.connected);});
		connection.on('message', function(message) {
			broadCast(message);
		});

		connection.on('close', function(reasonCode, description) {
			connections.splice(connections.indexOf(this), 1);
			 console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. ' + 'Reason: ' + reasonCode + '. Description ' + description);
		});
	});
};
