var mongoose = require('mongoose');

var AccessSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    accessCard: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date
    }
});
module.exports = AccessSchema;