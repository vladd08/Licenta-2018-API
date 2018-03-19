const
    ObjectId = require('mongodb').ObjectID,
    debug = require('debug'),
    express = require("express"),
    crypto = require("../../../helpers/middlewares/crypto"),
    AccessCode = require("../../../models/access"),
    User = require('../../../models/user');

class UserService {
    constructor(uow) {
        this.uow = uow;
    }

    getAll(callback) {
         this.uow.query('test','SELECT','','', null, {}, (result) => {
             return callback(result);
         });
    }

    getById(callback, id) {
        if(ObjectId.isValid(id)) {
            this.uow.query('Users','SELECT','_id',ObjectId(id), null, {},(result) => {
                return callback(result, null);
            });
        } else {
            return callback(null,new Error("Invalid ID"));
        }
    }

    getByUsernameAndPassword(callback, username, password) {
        debug(password);
        this.uow.query('Users','SELECT', 'username' , username, null, {}, (result) => {
            let user = result;
            if(user[0] != undefined) {
                crypto.Verify(password, user[0].password, function(res) {
                    if(res) return callback(user[0]);
                    else return callback(new Error("Wrong credentials, please try again!!"));
                });
            } else {
                console.log('A');
                return callback(new Error("Username not found!"));
            }
        });
    }

    insertUser(callback, data) {
        let userSchema = this.uow.createUserModel();
        let mUow = this.uow;
            crypto.Hash(data.password, function(result){
                if(result instanceof Error) {
                    return callback(new Error("Hashing error!"));
                } else {
                    data.password = result;
                    let accessCode = data.accessCard;
                    mUow.query('Users', 'INSERT', '', '', userSchema, data, function(resp){
                        if(resp) {
                            let accessSchema = mUow.createAccessModel();
                            let accessObj = {
                                username: resp.username,
                                accessCard: accessCode,
                                createdAt: Date.now()
                            };
                            mUow.query('AccessCodes', 'INSERT', '', '', accessSchema, accessObj, function(response) {
                                if(response) {
                                    return callback(resp);
                                } 
                            });
                        }
                    });
                 }
            });
    }

    //inserting the Card Code into db
    insertAccessCode(next, data) {
        let accessSchema = this.uow.createAccessModel();
        this.uow.query('AccessCodes', 'INSERT', '', '', accessSchema, data, function(err, resp) {
            if(err) {
                return next(err);
            } 
            else {
                return next(resp);
            }
        })
    }

    getAccessCodeByUsername(next, username) {
            this.uow.query('AccessCodes','SELECT','username', username, null, {},(result) => {
                return next(result);
            });
        }
}

module.exports = UserService;