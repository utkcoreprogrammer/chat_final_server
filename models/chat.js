var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var ChatSchema =  new Schema({
  created: Date,
  content: String,
  userId: Number,
  room: String
});
module.exports = mongoose.model('Chat', ChatSchema)
