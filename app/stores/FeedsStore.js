var AppDispatcher = require('../dispatcher/AppDispatcher')
	, appConstants = require('../constants/appConstants')
	, objectAssign = require('react/lib/Object.assign')
	, EventEmitter = require('events').EventEmitter
	, beep_snd = new Audio("/sound/chime-beep.mp3")
	, CHANGE_EVENT = 'zazzz_tx_change'

// state vars:
	, _store = {
		feeds: []
	}

	;

function setFeeds(data) {
	_store.feeds = data;
}

var FeedsStore = objectAssign({}, EventEmitter.prototype, {
	addChangeListener: function(cb) {
		this.on(CHANGE_EVENT, cb);
	},

	removeChangeListener: function(cb) {
		this.removeListener(CHANGE_EVENT, cb);
	},
	
	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	getFeeds: function() {
		return _store.feeds;
	}

});

FeedsStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.RECEIVE_FEEDS :
			console.log('RECEIVE_FEEDS ..... action:');
			console.dir(action);
			if (action.data) {
				setFeeds(action.data);
			}
			FeedsStore.emitChange();
			break;

		default:
			return true;
			break;
	}
});

module.exports = window.FSS = FeedsStore;
