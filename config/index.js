var config = {
	
	use_parent_config: false,
	
	redis_host: {
		host: 'localhost', port: 6379
	},

	passport_auth_keys: {
		'facebookAuth' : {
			'clientID' 		: 'your-secret-clientID-here', // your App ID
			'clientSecret' 	: 'your-client-secret-here', // your App Secret
			'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
		},

		'twitterAuth' : {
			'consumerKey' 		: 'your-consumer-key-here',
			'consumerSecret' 	: 'your-client-secret-here',
			'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
		},

		'googleAuth' : {
			'clientID' 		: 'your-secret-clientID-here',
			'clientSecret' 	: 'your-client-secret-here',
			'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
		}
	}
};

var objectMerge = require('object-merge')
	, parent_config
	;

try {
	parent_config = require('../../config');
} catch(parseErr) {
	// console.log('yep, no parent');	
}

module.exports = function get_config() {
    var local_config = {},
        env_config = {};
    
    parent_config = parent_config || {};
    if (!config.use_parent_config) { parent_config = {}; }

    try {
        local_config = require('./local_config');
    } catch(parseErr) {
		console.log('no local config file found (that *might* be ok)'+parseErr);
    }

    if (process.env.NODE_ENV) {
        try {
            env_config = require('./'+process.env.NODE_ENV+'_config');
        } catch(parseErr) {
            console.log("Environment config", process.env.NODE_ENV, "doesn't exist!");
        }
    }

    return objectMerge(parent_config, config, local_config, env_config);
    
}();
