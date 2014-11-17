var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	username: String,
	currentHighscore: {type: Number, default:0},
	userCreated: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', UserSchema);

