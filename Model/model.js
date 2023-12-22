const mongoose = require('mongoose');
const cardStatusSchema = new mongoose.Schema({
    id: String,
    phone_number: String,
    status: String,
    timestamp: { type: Date, default: Date.now }
});
module.exports  = mongoose.model('CardStatus', cardStatusSchema);
