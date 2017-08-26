var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name : {type:String},
	password : {type : String},
	admin : {type:Boolean}
});

var User = module.exports =  mongoose.model('User',userSchema);