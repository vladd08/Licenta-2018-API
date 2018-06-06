const
    ObjectId = require('mongodb').ObjectID,
    debug = require('debug'),
    express = require("express"),
    Project = require('../../../models/project');

class ProjectService {
    constructor(uow) {
        this.uow = uow;
    }

    // gets all projects
    getAllProjects(callback) {
        this.uow.query('Projects', 'SELECT', '', '', null, {}, function (result) {
            return callback(result);
        });
    }

    // gets a project by id
    getProjectById(callback, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('Projects', 'SELECT', '_id', ObjectId(id), null, {}, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    // gets all the assignments for a given user (on which project is one assigned)
    getAssignmentsForUser(callback, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('ProjectAsignments', 'SELECT', 'userId', id, null, {}, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    // gets all the users that are working on a project
    getUsersForProject(callback, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('ProjectAsignments', 'SELECT', 'projectId', id, null, {}, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    // adding hours to 'totalhours' of a project
    insertHoursToProject(callback, projectid, data) {
        this.uow.query('Projects', 'UPDATE', '_id', ObjectId(id), null, data, (result) => {
            return callback(result);
        });
    }

    // creates a project
    insertProject(callback, data) {
        var projectSchema = this.uow.createProjectModel();
        this.uow.query('Projects', 'INSERT', '', '', projectSchema, data, function (result) {
            return callback(result);
        });
    }

    // creates an assignment
    insertAssignment(callback, data) {
        var assignmentSchema = this.uow.createAssignmentModel();
        this.uow.query('ProjectAsignments', 'INSERT', '', '', assignmentSchema, data, function (result) {
            return callback(result);
        });
    }

    // updates a project
    updateProject(callback, data, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('Projects', 'UPDATE', '_id', ObjectId(id), null, data, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }
}

module.exports = ProjectService;