var React = require('react')
	, FeedsActions = require('../actions/FeedsActions')
//	, NamespaceActions = require('./actions/NamespaceActions')
	;

var NamespaceSelector = React.createClass({
	
	statics: {
		autoload_once: false
	},
	
	getInitialState: function() {
		return {
			namespaces: this.props.namespaces
		};
	},
	
	componentWillMount: function() {
	},

	componentDidMount: function() {
	},
	
	componentDidUpdate: function() {
		if (JSON.stringify(this.state.namespaces) !== JSON.stringify(this.props.namespaces)) {
			this.setState({
				namespaces: this.props.namespaces
			}, function() {
				if (!this.autoload_once) {
					this.autoload_once = true;
					if (this.props.current_namespace && this.state.namespaces.indexOf(this.props.current_namespace) > -1) {
						FeedsActions.getFeedsByNamespace(this.props.current_namespace);
					}
				}
			}.bind(this));
		}
	},
	
	componentWillUnmount: function() {
	},
	
	handleNamespaceChange: function(e) {
		if (e) { e.preventDefault(); }
		if (this.refs.ns_selector) {
			if (this.refs.ns_selector.getDOMNode().value) {
				this.props.setNamespace(this.refs.ns_selector.getDOMNode().value);
			}
		}
	},
	
	render: function() {
		
		var $SELECT;
		
		console.log('ns render');

		if (this.state.namespaces && this.state.namespaces.length) {
			
			$OPTIONS = this.state.namespaces.map(function(NS, IDX) {
				return (
					<option value={NS} key={IDX}>{NS}</option>
				);
			});
			
			var defVal = this.props.current_namespace && this.state.namespaces.indexOf(this.props.current_namespace) > -1
				? this.props.current_namespace : null;
			
			$SELECT = (
				<div>
					<select name="ns_selector" ref="ns_selector" defaultValue={defVal}>
					{$OPTIONS}
					</select>
				</div>
			);
			
		} else {
			$SELECT = (
				<p>no namespaces loaded yet</p>
			);
		}
		
		return (
			<form action="" method="post">
			<div className="row">
				<div className="large-4 medium-4 columns">
					<label htmlFor="ns">Select your namespace</label>
				</div>
				<div className="large-6 medium-6 columns">
					{$SELECT}
				</div>
				<div className="large-2 medium-2 columns">
					<button onClick={this.handleNamespaceChange} className="button tiny secondary">Set Namespace</button>
				</div>
			</div>
			</form>
		);
    }

});

module.exports = NamespaceSelector;