const mongoose = require('mongoose');

const MessageBotSchema = new mongoose.Schema({
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  text: String,
  file: String,
}, {timestamps:true});

const MessageBotModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;