var mongoose = require('mongoose'),
    ObjectId = require('mongodb').ObjectId;

var AssignmentSchema = new mongoose.Schema({
    projectId : {
        type: String,
        required: true
    },
    userId : {
        type: String,
        required: true
    }
});
module.exports = AssignmentSchema;