const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');


const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	name: {
		type: String, 
		required: true
	},
	state: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: true
	}
});

const shopperSchema = mongoose.Schema({
	user: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User' 
	},
	wallet: {
		type: Number,
		default: 0
	}
});

const delivererSchema = mongoose.Schema({
	user: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User' 
	}
});

userSchema.methods.encryptPassword = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);  
};
  
userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);  
};

module.exports = {
	'User': mongoose.model('User', userSchema),
	'Shopper': mongoose.model('Shopper', shopperSchema),
	'Deliverer': mongoose.model('Deliverer', delivererSchema)
}
