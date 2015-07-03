var SocketHandler = require('./SocketHandler')
	;

//console.dir(Object.keys(TxActions));

module.exports = {
	
	getNamespaces: function() {
		if (SocketHandler.socket && SocketHandler.socket.emit) {
			SocketHandler.socket.emit('get-namespaces');
		} else {
			setTimeout(function() {
				console.log('NO EMITTER');
				console.dir(SocketHandler);
				module.exports.getNamespaces() }, 1000);
		}
		
	}
	
};
