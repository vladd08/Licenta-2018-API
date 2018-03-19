const _config = require('../../bin/config'),
      mongodb = require("mongodb").MongoClient,
      debug = require('debug')('my-namespace'),
      _ = require('lodash');

let _db = _config.dbconfig;
let _dbConnection = undefined;

class UnitOfWorkFactory {
    static create(callback) {
        let uow = undefined;
        switch(_db.dbType) {
            case "mongodb":
            let MongoUnitOfWork = require("./MongoUnitOfWork");
            mongodb.connect('mongodb://' + _db.user +':' + _db.password + _db.host +'/' + _db.database, function(err, db) {
                if (err) {
                    debug('db connection error is %s', err);
                    return callback(err);
                }
                uow = new MongoUnitOfWork(db);
                return callback(uow);
            });
            break;
        }
    }
}

module.exports = UnitOfWorkFactory;
