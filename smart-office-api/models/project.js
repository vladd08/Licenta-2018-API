var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    estimated: {
        type: Number,
        required: true
    },
    started: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    hourstotal: {
        type: Number,
        default: 0,
        required: false
    },
    documentationlink: {
        type: String,
        required: false
    },
    gitlink: {
        type: String,
        required: false
    },
    issuetrackinglink: {
        type: String,
        required: false
    }
});
module.exports = ProjectSchema;