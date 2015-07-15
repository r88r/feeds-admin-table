var React = require('react')

	, debug = false
	
	, _renderField = function(name, label, field) {
		return (
			<div>
				<div className="large-4 columns">
					<label htmlFor={name} className="inline right">{label}</label>
				</div>
				<div className="large-8 columns">
					{field}
				</div>
				<div className="clearfix"></div>
			</div>
		);
	}
	;

function handleGenericChange(cb, e) {
	if (cb) { return cb(e); }
	else {
		var node = e.target
			, params = {}
			;
		params[node.name] = node.value;

		if (window.debug) {
			console.warn('no callback given for form field change event, blindly updating state based on "name" = '+node.name);
		}

		this.setState(params);
	}
}

function handleRadioClick(cb, e) {
	console.log('[handleRadioClick]');
	console.dir(e);
	return handleGenericChange.call(this, cb, e);
}

function handleCheckboxClick(cb, e) {
	console.log('[handleCheckboxClick]');
	console.dir(e);
	return handleGenericChange.call(this, cb, e);
}

function handleTextInputChange(cb, e) {
	return handleGenericChange.call(this, cb, e);
}

	

module.exports = {

	setDebug: function(db) {
		debug = (db); // "(truthy)"
	},
	
	// exposes above function to export module for external calling
	// (necessary for custom field render methods not in this package)
	renderField: function(name, label, field) {
		return _renderField(name, label, field);
	},
	
	/// GIANT DEV NOTE: this approach so far only works on objects, fails on arrays.
	/// updating an array will require some serious other handling
	/// (at least an index reference to get the right object)
	/// PROBABLY fixed by detecting an array or something??? dunno yet.

	// stateNest USAGE: to allow applying state updates to a nested dictionary within this.state

	updateDataPathState: function(path, value, stateNest) {

//		console.log('[FormMagic] updateDataPathState ....');

		//var STATE = this.state
		var STATE = this.setState ? this.state : this
			, parts = path.split('.')
			, ref
			, propname
			, stateRoot = stateNest ? STATE[stateNest] : STATE
			;
/*
		console.log('.... this: ' + JSON.stringify(this));
		console.log('.... path: ' + path);
		console.log('.... value: ' + value);
		console.log('.... STATE: ' + JSON.stringify(STATE));
		console.log('.... stateNest: ' + stateNest);
		console.log('.... stateRoot: ' + JSON.stringify(stateRoot));
//*/
		if (!stateRoot) { throw new Error('cannot update path in state, no (g)root!'); }

		while (parts.length > 1) {
			propname = parts.shift();
			ref = ref !== undefined ? ref[propname] : stateRoot[propname];
			if (ref === undefined && stateRoot[propname] == undefined) {
				stateRoot[propname] = {};
				ref = stateRoot[propname];
			}
		}

		propname = parts.shift();
		if (ref === undefined) { ref = stateRoot }

//		console.log('.... ref: ' + JSON.stringify(ref));

		ref[propname] = value;

		// allow to be used with plain objects....
		if (this.setState !== undefined) {
//			console.log('.... setting state');
			STATE.edited = true;
			this.setState(STATE);
		} else {
//			console.log('.... returning state:');
//			console.log( JSON.stringify(STATE) );
			return STATE;
		}
	},
	
	renderRadioInputs: function(name, label, value, options, path, cb) {
		if (debug) {
			console.log('[renderRadioInputs] field: '+name);
		}
		path = path || name;
		var radios = options.map(function(O, idx) {
			var checked = O == value ? true : false
				, KEY = idx + '-' + name
				;
			return (
				<span key={KEY}>
					<input type="radio" name={name} value={O} checked={checked} data-path={path} onChange={handleRadioClick.bind(this, cb)} /> {O}{' '}
				</span>
			);
		}.bind(this));
		return _renderField(name, label, radios);
	},
	
	renderBooleanCheckboxInput: function(name, label, checked, path, cb) {
		if (debug) {
			console.log('[renderBooleanCheckboxInput] field: '+name+', value: '+value);
		}
		path = path || name;
		return _renderField(name, label,
			<input type="checkbox" name={name} ref={name} data-boolfield={true} data-path={path} checked={checked} onChange={handleCheckboxClick.bind(this, cb)} />
		);
	},

	renderCheckboxInput: function(name, label, value, checked, path, cb) {
		throw new Error('regular checkbox not supported yet! (as in checkboxes that have non-boolean values');
		/*
		if (debug) {
			console.log('[renderCheckboxInput] field: '+name+', value: '+value);
		}
		path = path || name;
		return _renderField(name, label,
			<input type="checkbox" name={name} ref={name} data-path={path} checked={checked} onChange={handleCheckboxClick.bind(this, cb)} />
		);
		*/
	},

	renderTextInput: function(name, label, value, path, cb) {
		if (debug) {
			console.log('[renderTextInput] field: '+name);
		}
		value = value || null;
		path = path || name;
		return _renderField(name, label,
			<input type="text" name={name} ref={name} data-path={path} value={value} onChange={handleTextInputChange.bind(this, cb)} />
		);
	},

}