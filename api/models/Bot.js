const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
  botname: {type:String, unique:true}
}, {timestamps: true});

const BotModel = mongoose.model('Bot', BotSchema);
module.exports = BotModel;