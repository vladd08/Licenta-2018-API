const
    express = require('express'),
    ObjectId = require('mongodb').ObjectID,
    url = require('url'),
    debug = require('debug')('smart-office-api:server'),
    parser = require('body-parser'),
    UnitOfWork = require("../../../helpers/db/UnitOfWorkFactory"),
    config = require('../../config'),
    apiRoutes = require('../../../helpers/middlewares/auth'),
    HourService = require('../services/hoursService'),
    ProjectService = require("../services/projectService");

let router = express.Router();

router.use('/', apiRoutes);

router.put('/tracking/:id', function (req, res, next) {
    var body = req.body;
    var uId = req.params.id;
    if (body.hours >= 0 && body.minutes >= 0 && body.date && body.projectId) {
        let db = UnitOfWork.create((uow) => {
            if (uow instanceof Error) {
                next();
            } else {
                let hourTrackingData = {
                    hours: +req.body.hours,
                    minutes: +req.body.minutes,
                    date: new Date(req.body.date),
                    projectId: req.body.projectId,
                    userId: uId
                }
                let data = new HourService(uow);
                data.checkTrackingExists(function (result) {
                    var success = false;
                    if (result.length !== 0) {
                        for (let tracking of result) {
                            if (sameDay(new Date(tracking.date), new Date(hourTrackingData.date))
                                && tracking.projectId === hourTrackingData.projectId) {
                                success = true;
                                data.insertHourTracking(function (result) { //update
                                }, hourTrackingData, tracking._id);
                                break;
                            }
                        }
                        if (success === true) {
                            res.status(200).json({
                                'success': true,
                                'result': "Updated current tracking."
                            });
                        } else {
                            data.postHourTracking(function (result) { //insert
                            }, hourTrackingData, uId);
                            res.status(200).json({
                                'success': true,
                                'result': "No tracking existed. Inserted new tracking."
                            });
                        }
                    } else {
                        data.postHourTracking(function (result) {
                            res.status(200).json({
                                'success': true,
                                'result': hourTrackingData
                            });
                        }, hourTrackingData, uId);
                    }
                }, uId, hourTrackingData.data);
            }
        });
    } else {
        res.status(400).json({
            'success': false,
            'message': 'Please fill all the required data!'
        });
    }
});

router.get('/tracking/:id', function (req, res, next) {
    var datestart = new Date(req.body.datestart);
    var dateend = new Date(req.body.dateend);
    var id = req.params.id;
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
        } else {
            let hourService = new HourService(uow);
            hourService.getAllTrackingsInMonth(function (result) {
                res.status(200).json({
                    'success': true,
                    'result': result
                })
            }, id);
        }
    });
});

router.get('/tracking/requests/:id', function (req, res, next) {
    if (req.decoded.role != 'admin') return res.status(403).json({
        'error': 'unauthorized',
        'message': 'only admins can access this route.'
    });
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
        } else {
            let hourService = new HourService(uow);
            hourService.getTrackingRequests(function (result) {
                res.status(200).json({
                    'success': true,
                    'result': result
                });
            }, req.params.id);
        }
    });
});

router.put('/tracking/requests/:id', function (req, res, next) {
    if (req.decoded.role != 'admin') return res.status(403).json({
        'error': 'unauthorized',
        'message': 'only admins can access this route.'
    });
    var body = req.body;
    var trackingid = req.params.id;
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
        } else {
            let hourService = new HourService(uow);
            hourService.acceptTrackingRequest(function (result) {
                res.status(200).json({
                    'success': true,
                    'result': result
                });
            }, trackingid, body);
        }
    });
});

router.post('/tracking/requests', function (req, res, next) {
    var body = req.body;
    var userid = req.params.id;
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
        } else {
            let hourService = new HourService(uow);
            hourService.insertTrackingRequest(function (result) {
                res.status(200).json({
                    'success': true,
                    'result': result
                });
            }, body);
        }
    });
});

function sameDay(d1, d2) {
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
        d1.getUTCMonth() === d2.getUTCMonth() &&
        d1.getUTCDate() === d2.getUTCDate();
}

module.exports = router;