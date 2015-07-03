var config = {

  	mongo: {

	},
	
	redis_host: {
		host: 'localhost', port: 8111
	},

	passport: {
		usermodel: 'redis' // redis or mongo
	}

};

module.exports = config;
