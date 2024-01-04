const mongoose = require('mongoose');

const MessageBotSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderType'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientType'
  },
  senderType: {
    type: String,
    enum: ['User', 'Bot']
  },
  recipientType: {
    type: String,
    enum: ['User', 'Bot']
  },
  text: String
}, { timestamps: true });

const MessageBotModel = mongoose.model('MessageBot', MessageBotSchema);

module.exports = MessageBotModel;
