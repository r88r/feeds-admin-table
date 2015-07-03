/* set up websocket connection */
var io = require('ioClient')
	, socket_connected = false
	, app_socket = io.connect()
	, debug = true
	, FeedsActions //= require('../actions/FeedsActions')
	, NamespaceActions //= require('../actions/NamespaceActions')
	;

// uncomment below to see verbose Socket.io logs
// to turn it off, you have to manually set localStorage.debug = false, not just comment this back out
//localStorage.debug = '*';

app_socket.on('connect', function() {
	socket_connected = true;
});

app_socket.on('feeds-data', function(response) {
	var data = response.data;
	if (data && data.feeds && data.feeds instanceof Array && data.feeds.length) {

/*
			AppDispatcher.handleServerAction({
				actionType: appConstants.RECEIVE_FEEDS,
				data: data
			});
*/
		FeedsActions.receiveFeeds(null, data.feeds);
	} else {
		console.log(data);
		FeedsActions.receiveFeeds('no valid feed data received');
	}
});

app_socket.on('namespaces-data', function(response) {
	var data = response.data;
	if (data && data.namespaces && data.namespaces instanceof Array && data.namespaces.length) {
		NamespaceActions.receiveNamespaces(null, data.namespaces);
	} else {
		NamespaceActions.receiveNamespaces('no valid namespace data received');
	}
});

app_socket.on('message', function(response) {
	console.log('general message from server:');
	console.log(response);
});

var socket_handler = {
	socket: app_socket
}

socket_handler.isReady = function() { return socket_connected; }
socket_handler.emit = function(command, data) { app_socket.emit(command, data); }

module.exports = window.S_H = socket_handler;

// require race conditions again
FeedsActions = require('../actions/FeedsActions');
NamespaceActions = require('../actions/NamespaceActions');

console.log('what is FeedsActions');
console.dir(FeedsActions);