var React = require('react')

	, FeedsStore = require('./stores/FeedsStore')
	, FeedsActions = require('./actions/FeedsActions')
	, NamespaceStore = require('./stores/NamespaceStore')
	, NamespaceActions = require('./actions/NamespaceActions')

	, FeedTable = require('./components/FeedTable.js')
	, NamespaceSelector = require('./components/NamespaceSelector.js')

	, Utils = require('./utils/kf-utils')

	;


var App = React.createClass({
	
	getInitialState: function() {
		return {
			namespaces: [],
			feeds: [],
			current_namespace: Utils.getGetVar('ns', null)
		}
	},
	
	componentDidMount: function() {
		FeedsStore.addChangeListener(this._onFeedsStoreChange);
		NamespaceStore.addChangeListener(this._onNamespaceStoreChange);
		NamespaceActions.getNamespaces();
	},

	componentWillUnmount: function() {
		FeedsStore.removeChangeListener(this._onFeedsStoreChange);
		NamespaceStore.removeChangeListener(this._onNamespaceStoreChange);
	},
	
	_onFeedsStoreChange: function() {
		this.setState({
			feeds: FeedsStore.getFeeds()
		});
	},

	_onNamespaceStoreChange: function() {
		this.setState({
			namespaces: NamespaceStore.getNamespaces()
		});
	},
	
	setNamespace: function(ns) {
		this.setState({
			current_namespace: ns
		}, function() {
			//console.log('????? setState callback???????');
			FeedsActions.getFeedsByNamespace(ns);
		});
	},

	render: function(){

		console.log('render Feeds App Container');
		
		return (
			<div>
				<h3>Sociative Feeds List</h3>
				<div className="row">
				<div className="large-10 medium-10 columns large-centered">
					<NamespaceSelector namespaces={this.state.namespaces} current_namespace={this.state.current_namespace} setNamespace={this.setNamespace} />
				</div>
				</div>
				<div className="row">
				<div className="large-12 medium-12 columns">
					<FeedTable feeds={this.state.feeds} current_namespace={this.state.current_namespace} />
				</div>
				</div>
			</div>
		);
	}

});

React.render(
  <App />,
  document.getElementById('app')
);
