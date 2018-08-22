var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema(
	{
		username: {type: String, lowercase: true},
		email: {type: String, lowercase: true},
		password: {type: String}
		
	});
module.exports = mongoose.model('User', userSchema)