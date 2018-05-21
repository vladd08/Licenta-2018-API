const
    ObjectId = require('mongodb').ObjectID,
    debug = require('debug'),
    express = require("express");

class HourService {
    constructor(uow) {
        this.uow = uow;
    }

    insertHourTracking(callback, data, id) {
        var hourSchema = this.uow.createHourSchema();
        this.uow.query('HourTracking', 'UPDATE', '_id', ObjectId(id), hourSchema, data, function (result) {
            return callback(result);
        });
    }

    postHourTracking(callback, data, id) {
        var hourSchema = this.uow.createHourSchema();
        this.uow.query('HourTracking', 'INSERT', '', '', hourSchema, data, function (result) {
            return callback(result);
        });
    }

    getAllTrackingsInMonth(callback, id) {
        this.uow.query('HourTracking', 'SELECT', 'userId', id, null, {}, function (result) {
            return callback(result);
        });
    }

    checkTrackingExists(callback, userid, date) {
        this.uow.query('HourTracking', 'SELECT', 'userId', userid, null, {}, function (result) {
            return callback(result);
        });
    }

    getTrackingRequests(callback, id) {
        this.uow.query('TrackingRequests', 'SELECT', 'status', 'pending', null, {}, function (result) {
            return callback(result);
        });
    }

    insertTrackingRequest(callback, body) {
        var requestSchema = this.uow.createRequestSchema();
        this.uow.query('TrackingRequests', 'INSERT', '', '', requestSchema, body, function (result) {
            return callback(result);
        });
    }

    acceptTrackingRequest(callback, trackingid, data) {
        this.uow.query('TrackingRequests', 'UPDATE', '_id', ObjectId(trackingid), null, data, function (res) {
            return callback(res);
        });
    }
}

module.exports = HourService;