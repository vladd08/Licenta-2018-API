const
    ObjectId = require('mongodb').ObjectID,
    debug = require('debug'),
    express = require("express");

class HourService {
    constructor(uow) {
        this.uow = uow;
    }

    // updates an existing hour tracking object in the database
    insertHourTracking(callback, data, id) {
        this.uow.query('HourTracking', 'UPDATE', '_id', ObjectId(id), {}, data, function (result) {
            return callback(result);
        });
    }

    // gets all the requests that need approval
    getTrackingRequests(callback) {
        this.uow.query('TrackingRequests', 'SELECT', 'status', 'pending', null, {}, function (result) {
            return callback(result);
        });
    }

    // gets all tracking records of a user for the current month
    getAllTrackingsInMonth(callback, id) {
        const mondays = this.getMondays();
        const sundays = this.getNextSundays(mondays[0]);
        this.uow.query('HourTracking', 'SELECT', ['userId'], [id],
            null, {}, function (result) {
                return callback(result);
            });
    }

    getMondays() {
        let d = new Date();
        let month = d.getMonth();
        const mondays = [];
        const y = d.getFullYear(), m = d.getMonth();
        const firstDay = new Date(y, m, 1);
        const todayDate = new Date(Date.now());
        if (firstDay.getDate() === todayDate.getDate()) {
            month -= 1;
        }
        d = new Date(y, month);
        d.setDate(1);
        // Get the first Monday in the month
        while (d.getDay() !== 1) {
            d.setDate(d.getDate() + 1);
        }
        // Get all the other Mondays in the month
        while (d.getMonth() === month) {
            mondays.push(new Date(d.getTime()));
            d.setDate(d.getDate() + 7);
        }
        return mondays;
    }

    getNextSundays(currentMonday) {
        const sundays = [];
        let nextSunday = this.getSundayOfWeek(currentMonday);
        sundays.push(new Date(nextSunday));
        for (let i = 0; i < 3; i++) {
            nextSunday = new Date(nextSunday.setDate(nextSunday.getDate() + 7));
            sundays.push(new Date(nextSunday));
        }
        return sundays;
    }

    getSundayOfWeek(date) {
        const day = date.getDay();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day === 0 ? 0 : 7) - day);
    }

    // if a tracking records does not exist, insert a new one
    postHourTracking(callback, data, id) {
        var hourSchema = this.uow.createHourSchema();
        this.uow.query('HourTracking', 'INSERT', '', '', hourSchema, data, function (result) {
            return callback(result);
        });
    }

    // creates a request to be approved
    insertTrackingRequest(callback, body) {
        var aux = this.uow;
        var requestSchema = this.uow.createRequestSchema();
        this.getTrackingRequests(function (result) {
            let exists = false;
            for (let request of result) {
                if (request.month === body.month && request.userId === body.userId) {
                    exists = true;
                }
            }
            if (!exists) {
                aux.query('TrackingRequests', 'INSERT', '', '', requestSchema, body, function (result) {
                    return callback(result);
                });
            } else {
                return callback(new Error('Already requested approval for this month.'));
            }
        });
    }

    // updates a tracking's status from 'pending' to 'approved'
    acceptTrackingRequest(callback, trackingid, data) {
        this.uow.query('TrackingRequests', 'UPDATE', '_id', ObjectId(trackingid), null, data, function (res) {
            return callback(res);
        });
    }
}

module.exports = HourService;