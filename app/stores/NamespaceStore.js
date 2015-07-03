var AppDispatcher = require('../dispatcher/AppDispatcher')
	, appConstants = require('../constants/appConstants')
	, objectAssign = require('react/lib/Object.assign')
	, EventEmitter = require('events').EventEmitter
	, CHANGE_EVENT = 'zazzz_tx_change'

// state vars:
	, _store = {
		namespaces: []
	}

	;

function setNamespaces(data) {
	_store.namespaces = data;
}

var NamespaceStore = objectAssign({}, EventEmitter.prototype, {
	addChangeListener: function(cb) {
		this.on(CHANGE_EVENT, cb);
	},

	removeChangeListener: function(cb) {
		this.removeListener(CHANGE_EVENT, cb);
	},
	
	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	getNamespaces: function() {
		return _store.namespaces;
	}

});

NamespaceStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.RECEIVE_NAMESPACES :
			console.log('RECEIVE_NAMESPACES ..... action:');
			console.dir(action);
			if (action.data) {
				setNamespaces(action.data);
			}
			NamespaceStore.emitChange();
			break;

		default:
			return true;
			break;
	}
});

module.exports = NamespaceStore;
