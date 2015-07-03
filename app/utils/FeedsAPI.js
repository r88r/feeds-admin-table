var SocketHandler = require('./SocketHandler')
	;

module.exports = {
	
	getFeedsByNamespace: function(ns) {
		SocketHandler.socket.emit('get-feeds-by-namespace', { ns: ns });
	}
	
};
