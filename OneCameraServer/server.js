var http = require('http');
var WebSocketCamera = require('./libs/wscamera').server;

var server = http.createServer(function(request, response){
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(8080, function() {
	console.log((new Date()) + 'Server is listening on port 8080');
});

var wscamera = new WebSocketCamera(server);
