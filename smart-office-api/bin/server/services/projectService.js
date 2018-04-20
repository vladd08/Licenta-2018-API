const
    ObjectId = require('mongodb').ObjectID,
    debug = require('debug'),
    express = require("express"),
    Project = require('../../../models/project');
    
class ProjectService {
    constructor(uow) {
        this.uow = uow;
    }

    insertProject(callback, data) {
        var projectSchema = this.uow.createProjectModel();
        this.uow.query('Projects', 'INSERT', '', '', projectSchema, data, function(result) {
            return callback(result);
        });
    }

    getAllProjects(callback) {
        this.uow.query('Projects', 'SELECT' , '', '', null, {}, function(result){
            return callback(result);
        });
    }

    getProjectById(callback, id) {
        if(ObjectId.isValid(id)) {
            this.uow.query('Projects','SELECT','_id',ObjectId(id), null, {},(result) => {
                return callback(result, null);
            });
        } else {
            return callback(null,new Error("Invalid ID"));
        }
    }
}

module.exports = ProjectService;