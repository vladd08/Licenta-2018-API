var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
    userId: {
        required: true,
        type: String
    },
    status: {
        required: true,
        type: String
    },
    month: {
        required: true,
        type: Number
    }
});

module.exports = RequestSchema;