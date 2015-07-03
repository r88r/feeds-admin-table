/**
 * Created by aldo on 07/08/14.
 * Co-opted by kfancy on 12/02/14.
 */
/* jshint indent: 4, laxcomma: true */
"use strict";

var mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, crypto = require('crypto') // kent was planning to use crypto
	, bcrypt   = require('bcrypt-nodejs') // quick passport example uses bcrypt, fine for now
	, config = require('../config')
	, mtypes = require('mongoose-types')
	;

mtypes.loadTypes(mongoose);

var User = new Schema({

    passport: {
		local            : {
			email        : String,
			password     : String,
		},
		facebook         : {
			id           : String,
			token        : String,
			email        : String,
			name         : String
		},
		twitter          : {
			id           : String,
			token        : String,
			displayName  : String,
			username     : String
		},
		google           : {
			id           : String,
			token        : String,
			email        : String,
			name         : String
		}
	},

	firstname : { type: String },
	lastname : { type: String },
	email : { type: Schema.Types.Email }, // , required: 'Email is required'
	password_sha256 : { type: String }, // , required: 'Password is required'
	PIN : { type: String },
	
	credit: { type: Number, default: 0.00 },
	
	credit_by_zazzz: { type: Schema.Types.Mixed },
	
	credit_history: [{
		ts: { type: Number, default: Date.now },
		remote_session_id: { type: String },
		credit: { type: Number }
	}],

	tokens: [{
		token_type: { type: String, enum: ['hash', 'token'], default: 'token' }, // "hash" or "token", not really sure why I need to know?
		card_type: { type: String, enum: ['license', 'id', 'secondary', 'medical', 'medcard', 'other'], default: 'license' },
		token: { type: String, required: 'token is required to make a token!!!' },
		id: { type: String } // reference ID to use with "swipes", perhaps elsewhere... manually generate it
	}],

	card_swipes: [{
		ts: { type: Number, default: Date.now },
		machine_id: { type: Schema.Types.ObjectId, ref: 'ZaZZZ' },
		token_id: { type: String }
	}],
	
	zazzz_image_captures: [{
		ts: { type: Number, default: Date.now },
		machine_id: { type: Schema.Types.ObjectId, ref: 'ZaZZZ' },
		image_url: { type: String }
	}],
	
	username : { type: String },
	mobile_phone: { type: String },
//	payment: { type: String },
	timezone : { type: String, default: 'EDT' },
	reset_password_token: { type: String },
	reset_password_expires: Date,

//	card_first_name: { type: String },
//	card_last_name: { type: String },
//	stripe_card_token: { type: String },
//	stripe_customer_id: { type: String },
//	stripe_subscription_id: { type: String },
//	stripe_plan: { type: String },

	isGhostUser: { type: Boolean, default: false },
	unghosted_at: { type: String },
	enabled: { type: Boolean, default: true },
	read_agree_tos: { type: Boolean, default: false },

	created_ts: { type: Number, default: Date.now },
	updated_ts: { type: Number, default: Date.now },
	creation_date: { type: Date, default: function() { return new Date().toUTCString() } },

//	phone_number_on_shipping_label: { type: Boolean, default: true },

// license info:
	dob: { type: Date },
	weight: { type: String },
	height: { type: String },
	eye_color: { type: String },
	hair_color: { type: String },
	sex: { type: String },

	billing_address : {
		address_line1 : { type: String },
		address_line2 : { type: String },
		zip : { type: String },
		city : { type: String },
		state : { type: String },
		country : { type: String, default: 'US' }
	},
	
	shipping_address : {
		address_line1 : { type: String },
		address_line2 : { type: String },
		zip : { type: String },
		city : { type: String },
		state : { type: String },
		country : { type: String, default: 'US' }
	}
}, {
	collection: config.mongo.collections.users

//}, { strict: false }); // allows any property
}); // only allows properties that are defined above

// Indexes
User.path('email').index({ unique: true, sparse: true }); // sparse: true == "only unique if property exists"

User.methods.authenticate = function(plain) {
	return this.constructor.encryptPassword(plain) == this.password_sha256;
};

User.methods.isEnabled = function() {
	return this.enabled;
};

/* make this a virtual??? */
User.methods.set_password = function(pw) {
	console.log('uModel.set_password is disabled.... using passport now.');
	return false;
	if (pw) {
		this.password_sha256 = this.constructor.encryptPassword(pw);
		//console.log('pw: '+this.password_sha256);
		return true;
	}
	return false;
};

User.statics.encryptPassword = function (str) {
	//console.log('ENCRYPT! salt: '+config.pw_salt);
	return crypto.createHmac('sha256', config.pw_salt).update(str).digest('hex');
};

User.pre('save', function(next) {
	return next();
});

// generating a hash
User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.passport.local.password);
};

var MODEL
	, MODELNAME = 'User';
if (mongoose.models[MODELNAME]) {
	MODEL = mongoose.model(MODELNAME);
} else {
	MODEL = mongoose.model(MODELNAME, User);
}
module.exports = MODEL;
