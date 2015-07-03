var AppDispatcher = require('../dispatcher/AppDispatcher')
	, appConstants = require('../constants/appConstants')
	, FeedsAPI //= require('../utils/FeedsAPI')
	, _store = {
		feeds: []
	}
	;

var FeedsActions = {

// markers / local client housekeeping
	getFeedsByNamespace: function(ns) {
		FeedsAPI.getFeedsByNamespace(ns);
	},
	
// RECEIVERS
	receiveFeeds: function(err, data) {
		if (err) {
			console.error('[receiveFeeds] err!!! '+err);
		} else {
			AppDispatcher.handleServerAction({
				actionType: appConstants.RECEIVE_FEEDS,
				data: data
			});
		}
	}
	
};

module.exports = FeedsActions;

// race
FeedsAPI = require('../utils/FeedsAPI')