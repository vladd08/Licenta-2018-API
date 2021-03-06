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

    // gets all users
    getAllUsers(callback) {
        this.uow.query('Users', 'SELECT', '', '', null, {}, (result) => {
            return callback(result);
        });
    }

    // gets a user by id
    getById(callback, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('Users', 'SELECT', '_id', ObjectId(id), null, {}, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    // gets a user by username and password - used for login
    getByUsernameAndPassword(callback, username, password) {
        this.uow.query('Users', 'SELECT', 'username', username, null, {}, (result) => {
            let user = result;
            if (user[0] != undefined) {
                crypto.Verify(password, user[0].password, function (res) {
                    if (res) return callback(user[0]);
                    else return callback(new Error("Wrong credentials, please try again!!"));
                });
            } else {
                return callback(new Error("Username not found!"));
            }
        });
    }

    // creates a new user
    insertUser(callback, data) {
        let userSchema = this.uow.createUserModel();
        let mUow = this.uow;
        crypto.Hash(data.password, function (result) {
            if (result instanceof Error) {
                return callback(new Error("Hashing error!"));
            } else {
                data.password = result;
                let accessCode = data.accessCard;
                mUow.query('Users', 'INSERT', '', '', userSchema, data, function (resp) {
                    if (resp) {
                        let accessSchema = mUow.createAccessModel();
                        let accessObj = {
                            username: resp.username,
                            accessCard: accessCode,
                            createdAt: Date.now()
                        };
                        mUow.query('AccessCodes', 'INSERT', '', '', accessSchema, accessObj, function (response) {
                            if (response) {
                                return callback(resp);
                            }
                        });
                    }
                });
            }
        });
    }

    // inserting the Card Code into db
    insertAccessCode(next, data) {
        let accessSchema = this.uow.createAccessModel();
        this.uow.query('AccessCodes', 'INSERT', '', '', accessSchema, data, function (err, resp) {
            if (err) {
                return next(err);
            }
            else {
                return next(resp);
            }
        })
    }

    // gets the access code for a user
    getAccessCodeByUsername(next, username) {
        this.uow.query('AccessCodes', 'SELECT', 'username', username, null, {}, (result) => {
            return next(result);
        });
    }

    // delete a user
    deleteUser(callback, id) {
        if (ObjectId.isValid(id)) {
            this.uow.query('Users', 'DELETE', '_id', ObjectId(id), null, {}, (result) => {
                console.log(result);
                return callback(result, null);
            });
        } else {
            return callback(null, new Error("Invalid ID"));
        }
    }

    // delete an access code (only when deleting the user)
    deleteAccessCode(callback, username) {
        this.uow.query('AccessCodes', 'DELETE', 'username', username, null, {}, (result) => {
            return callback(result, null);
        });
    }

    // update a user's data
    updateUser(callback, id, data) {
        if (ObjectId.isValid(id)) {
            this.uow.query('Users', 'UPDATE', '_id', ObjectId(id), null, data, (result) => {
                return callback(result, null);
            });
        } else {
            return callback(null, new Error('invalid user id'));
        }
    }
}

module.exports = UserService;