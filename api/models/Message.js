const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  chatToBot: { type: Boolean, default: false},
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function() {
      return this.chatToBot ? 'Bot' : 'User';
    }
  },
  text: String,
  file: String,
}, {timestamps:true});

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;