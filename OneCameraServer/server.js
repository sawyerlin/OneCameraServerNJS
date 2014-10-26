var WebSocketServer = require('websocket').server;
var http = require('http');
var _ = require('underscore');

var server = http.createServer(function(request, response){
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(8080, function() {
	console.log((new Date()) + 'Server is listening on port 8080');
});


var connections = [];

var wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false,
	maxReceivedFrameSize: '5MiB',
	maxReceivedMessageSize: '50MiB'
});

function originIsAllowed(origin){
	return true;
}

function broadCast(data){
	var receivers = _.where(connections, {resource: '/receive'});
	console.log(receivers.length);
}

wsServer.on('request', function(request){
	if(!originIsAllowed(request.origin)){
		request.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
		return;
	}

	var connection = request.accept('echo-portocol', request.origin);
	connection.resource = request.resource;
	console.log(connection.resource);
	connections.push(connection);
	_.each(connections, function(con){console.log(con.remoteAddress + " Connected: " + con.connected);});
	console.log((new Date()) + ' Connection accepted.');
	connection.on('message', function(message){
		broadCast(message);
		if(message.type === 'utf8'){
		//	console.log('Received Message: ' + message.utf8Data);
		//	connection.sendUTF(message.utf8Data);
		}	
		else if (message.type === 'binary') {
		//	console.log('Received Binary Message of ' + message.binaryData.length + ' bytes')
		//	connection.sendBytes(message.binaryData);
		}
		else {
			// console.log(message)
		}
	});

	connection.on('close', function(reasonCode, description) {
		connections.splice(connections.indexOf(this), 1);
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. ' + 'Reason: ' + reasonCode + '. Description ' + description);
	});
});
