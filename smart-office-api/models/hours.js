var mongoose = require('mongoose');

var HourSchema = new mongoose.Schema({
    hours: {
        type: Number,
        required: true
    },
    minutes: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
});
module.exports = HourSchema;