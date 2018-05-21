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
        this.uow.query('Projects', 'INSERT', '', '', projectSchema, data, function (result) {
            return callback(result);
        });
    }

    insertAssignment(callback, data) {
        var assignmentSchema = this.uow.createAssignmentModel();
        this.uow.query('ProjectAsignments', 'INSERT', '', '', assignmentSchema, data, function (result) {
            return callback(result);
        });
    }

    getAllProjects(callback) {
        this.uow.query('Projects', 'SELECT', '', '', null, {}, function (result) {
            return callback(result);
        });
    }

    getProjectById(callback, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('Projects', 'SELECT', '_id', ObjectId(id), null, {}, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    updateProject(callback, data, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('Projects', 'UPDATE', '_id', ObjectId(id), null, data, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    getAssignmentsForUser(callback, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('ProjectAsignments', 'SELECT', 'userId', id, null, {}, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    getUsersForProject(callback, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('ProjectAsignments', 'SELECT', 'projectId', id, null, {}, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    insertHoursToProject(callback, projectid, data) {
        this.uow.query('Projects', 'UPDATE', '_id', ObjectId(id), null, data, (result) => {
            return callback(result);
        });
    }
}

module.exports = ProjectService;