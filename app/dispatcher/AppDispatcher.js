var Dispatcher = require('flux').Dispatcher
	, AppDispatcher = new Dispatcher()
	;

AppDispatcher.handleViewAction = function(action) {
	this.dispatch({
		source: 'VIEW_ACTION',
		action: action // <<< this is an object, not a string: { actionType: FOO_CONSTANT, data: {} }
	});
};

AppDispatcher.handleServerAction = function(action) {
	this.dispatch({
		source: 'SERVER_ACTION',
		action: action // <<< this is an object, not a string: { actionType: FOO_CONSTANT, data: {} }
	});
};

module.exports = AppDispatcher;