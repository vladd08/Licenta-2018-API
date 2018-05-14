const
    express = require('express'),
    url = require('url'),
    debug = require('debug')('smart-office-api:server'),
    parser = require('body-parser'),
    UnitOfWork = require("../../../helpers/db/UnitOfWorkFactory"),
    config = require('../../config'),
    apiRoutes = require('../../../helpers/middlewares/auth'),
    ProjectService = require("../services/projectService");

let router = express.Router();

router.use('/', apiRoutes);

router.post('/project', function (req, res, next) {
    if (req.decoded.role == 'admin' || req.decoded.role == 'projectmanager') {
        var body = req.body;
        debug(body);
        let db = UnitOfWork.create((uow) => {
            if (uow instanceof Error) {
                next();
            } else {
                let data = new ProjectService(uow);
                if (req.body.name && req.body.description && req.body.estimated && req.body.started
                    && req.body.deadline) {
                    var projectData = {
                        name: req.body.name,
                        description: req.body.description,
                        estimated: req.body.estimated,
                        started: new Date(req.body.started).toUTCString().split(' ').slice(0, 4).join(' '),
                        deadline: new Date(req.body.deadline).toUTCString().split(' ').slice(0, 4).join(' '),
                        documentationlink: req.body.documentationlink,
                        gitlink: req.body.gitlink,
                        issuetrackinglink: req.body.issuetrackinglink
                    };
                    data.insertProject(function (result) {
                        if (result.errmsg) {
                            res.status(400).json({ error: "There is already a project with this name." });
                        } else if (res.errors) {
                            res.status(400).json({ error: "Please fill all the required data." });
                        } else {
                            res.status(200).json("Project '" + result.name + "' " + " was added successfuly!");
                        }
                    }
                        , projectData);
                } else {
                    res.status(400).json({ error: "Please fill all the required data." });
                }
            }
        });
    }
    else {
        return res.status(403).json({
            'error': 'unauthorized',
            'message': 'Only admins or project managers can access this route.'
        });
    }
});

router.get('/all', function (req, res, next) {
    if (req.decoded.role == 'admin' || req.decoded.role == 'projectmanager') {
        let db = UnitOfWork.create((uow) => {
            if (uow instanceof Error) {
                next();
            } else {
                var data = new ProjectService(uow);
                data.getAllProjects(function (result) {
                    res.status(200).json({
                        'success': true,
                        'result': result
                    });
                    uow.complete();
                });
            }
        });
    }
    else {
        return res.status(403).json({
            'error': 'unauthorized',
            'message': 'Only admins or project managers can access this route.'
        });
    }
});

router.get('/project/:id', function (req, res, next) {
    var id = req.params.id;
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
        } else {
            var data = new ProjectService(uow);
            data.getProjectById(function (result, err) {
                if (err) {
                    err.status = 400;
                    next(err);
                }
                else res.status(200).json({
                    'success': true,
                    'result': result
                });
                uow.complete();
            }, id);
        }
    });

});

router.put('/project/:id', function (req, res, next) {
    if (req.decoded.role == 'admin' || req.decoded.role == 'projectmanager') {
        var id = req.params.id;
        let db = UnitOfWork.create((uow) => {
            if (uow instanceof Error) {
                next();
            } else {
                const id = req.params.id;
                const body = req.body;
                var data = new ProjectService(uow);
                data.updateProject((response, err) => {
                    if (err) {
                        err.status = 400;
                        next(err);
                    }
                    else if (response.result.n == 0) {
                        res.status(404).json({
                            success: 'false',
                            message: 'No user found with that id. Nothing updated.'
                        });
                    } else if (response.result.nModified == 0) {
                        res.status(304).json({
                            success: 'false',
                            message: 'Nothing was updated.'
                        });
                    } else {
                        res.status(200).json({
                            success: 'true',
                            message: 'Updated successfully!'
                        });
                    }
                }, body, id);
            }
        });
    } else {
        return res.status(403).json({
            'error': 'unauthorized',
            'message': 'Only admins or project managers can access this route.'
        });
    }
});

router.post('/assignment', function (req, res, next) {
    if (req.decoded.role == 'admin' || req.decoded.role == 'projectmanager') {
        var id = req.params.id;
        let db = UnitOfWork.create((uow) => {
            if (uow instanceof Error) {
                next();
            } else {
                const id = req.params.id;
                const body = req.body;
                if (body.projectId && body.userId) {
                    var data = new ProjectService(uow);
                    data.insertAssignment((response, error) => {
                        if (response instanceof Error) {
                            next(response);
                        } else {
                            debug(response);
                            res.status(200).json({
                                "success": true,
                                "message": "Assignment added successfully!"
                            });
                        }
                    }, body);
                } else {
                    return res.status(400).json({
                        'error': 'Bad Request',
                        'message': 'Please give all the required information.'
                    });
                }
            }
        });
    } else {
        return res.status(403).json({
            'error': 'unauthorized',
            'message': 'Only admins or project managers can access this route.'
        });
    }
});

router.get('/assignment/user/all/:id', function (req, res, next) {
    if (req.decoded.role == 'admin' || req.decoded.role == 'projectmanager') {
        var id = req.params.id;
        let db = UnitOfWork.create((uow) => {
            if (uow instanceof Error) {
                next();
            } else {
                const id = req.params.id;
                debug(id);
                var data = new ProjectService(uow);
                data.getAssignmentsForUser((response, err) => {
                    if (err) {
                        err.status = 400;
                        next(err);
                    }
                    else res.status(200).json({
                        'success': true,
                        'result': response
                    });
                    uow.complete();
                }, id);
            }
        });
    } else if (req.decoded.role == 'angajat') {
        var requestedId = req.params.id;
        var userId = req.decoded.userId;
        if (userId == requestedId) {
            let db = UnitOfWork.create((uow) => {
                if (uow instanceof Error) {
                    next();
                } else {
                    const id = req.params.id;
                    debug(id);
                    var data = new ProjectService(uow);
                    data.getAssignmentsForUser((response, err) => {
                        if (err) {
                            err.status = 400;
                            next(err);
                        }
                        else res.status(200).json({
                            'success': true,
                            'result': response
                        });
                        uow.complete();
                    }, id);
                }
            });
        } else {
            return res.status(403).json({
                'error': 'unauthorized',
                'message': 'You can access only your data.'
            });
        }
    } else {
        return res.status(403).json({
            'error': 'unauthorized',
            'message': 'Only admins or project managers can access this route.'
        });
    }
});

router.get('/assignment/project/all/:id', function (req, res, next) {
    if (req.decoded.role == 'admin' || req.decoded.role == 'projectmanager') {
        var id = req.params.id;
        let db = UnitOfWork.create((uow) => {
            if (uow instanceof Error) {
                next();
            } else {
                const id = req.params.id;
                debug(id);
                var data = new ProjectService(uow);
                data.getUsersForProject((response, err) => {
                    if (err) {
                        err.status = 400;
                        next(err);
                    }
                    else res.status(200).json({
                        'success': true,
                        'result': response
                    });
                    uow.complete();
                }, id);
            }
        });
    } else {
        return res.status(403).json({
            'error': 'unauthorized',
            'message': 'Only admins or project managers can access this route.'
        });
    }
});

module.exports = router;