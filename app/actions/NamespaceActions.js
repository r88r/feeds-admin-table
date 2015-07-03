var AppDispatcher = require('../dispatcher/AppDispatcher')
	, appConstants = require('../constants/appConstants')
	, NamespaceAPI = require('../utils/NamespaceAPI')
	, _store = {
		namespaces: []
	}
	;

var NamespaceActions = {

// GETTERS
	getNamespaces: function() {
		NamespaceAPI.getNamespaces(); //this.receiveSessionData.bind(this))
	},
	
// RECEIVERS
	receiveNamespaces: function(err, data) {
		if (err) {
			console.error('[receiveNamespaces] err!!! '+err);
		} else {
			AppDispatcher.handleServerAction({
				actionType: appConstants.RECEIVE_NAMESPACES,
				data: data
			});
		}
	}
	
};

module.exports = NamespaceActions;

// include race condition, figure out why!
//NamespaceAPI = require('../utils/NamespaceAPI')
