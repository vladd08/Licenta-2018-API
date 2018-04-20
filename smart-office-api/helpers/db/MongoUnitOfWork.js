const userSchema = require('../../models/user'),
      accessSchema = require('../../models/access'),
      projectSchema = require('../../models/project'),
      crypto = require('bcrypt-nodejs'),
      mongoose = require('mongoose');

class MongoUnitOfWork {
    constructor(db) {
        this.client = db;
        this.db = this.client.db();
        mongoose.connect(this.client.s.url);
    }

    query(collection,operation,criteria,value,schema,jsonobj,callback) {
        switch(operation) {
            case 'SELECT' : 
            if(criteria == '') {
                this.db.collection(collection).find().toArray(function(err,results) {
                    if (err) this.db.rollback();
                    return callback(results);
                });
            } else {
                var query = {};
                query[criteria] = value;
                this.db.collection(collection).find(query).toArray(function(err,results) {
                    if (err) this.db.rollback();
                    return callback(results);
                });
            }
            break;
            case 'INSERT' : 
            schema.create(jsonobj,function(err, user) {
                if(err) {
                    return callback(err);
                } else {
                    return callback(user);
                }
            });
            break;
            case 'UPDATE' :
                var query = {};
                query[criteria] = value;
                this.db.collection(collection).update(query, { $set : jsonobj }, function(err, result){
                    if(err) return callback(err);
                    return callback(result);
                });
            break;
            case 'DELETE' : 
                var query = {};
                query[criteria] = value;
                try {
                    this.db.collection(collection).deleteOne(query, function(err, result) {
                        if(err) return callback(err);
                        return callback(result.deletedCount);
                    });
                }
                catch(e) {
                    return callback(e);
                }
            break;
        }
    }

    createUserModel() {
        var userModel = mongoose.model('User', userSchema, 'Users');
        return userModel;
    }

    createAccessModel() {
        var accessModel = mongoose.model('Access', accessSchema, 'AccessCodes');
        return accessModel;
    }

    createProjectModel() {
        var projectModel = mongoose.model('Project', projectSchema, 'Projects');
        return projectModel;
    }

    complete() {
        this.client.close();
    }
}

module.exports = MongoUnitOfWork;