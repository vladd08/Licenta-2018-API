const   
    express = require('express'),
    url = require('url'),
    debug = require('debug')('smart-office-api:server'),
    parser = require('body-parser'),
    UnitOfWork = require("../../../helpers/db/UnitOfWorkFactory"),
    jwt = require('jsonwebtoken'),
    config = require('../../config'),
    apiRoutes = require('../../../helpers/middlewares/auth'),
    notp = require('notp'),
    UserService = require("../services/userService");

let router = express.Router();

router.get('/', function(req,res){
    res.json({"Response":"You accessed the users controller!"});
});

//using the auth middleware
router.use('/test', apiRoutes);
router.use('/register', apiRoutes);
router.use('/login/2fa/verify', apiRoutes);

router.get('/test', function(req,res,next){
    if(req.decoded.role != 'admin') return res.status(403).json({
        'error':'unauthorized',
        'message':'only admins can access this route.'
    });
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
        } else {
            let data = new UserService(uow);
            data.getAll((result) => {
                debug('test result for GET is %s', JSON.stringify(result));
                res.status(200).json(result);
                uow.complete()
            });
        }
    });
});

router.get('/test/:id', function(req,res,next){
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
        } else {
            let data = new UserService(uow);
            let id = req.params.id;
            data.getById((result, err) => {
                if(err) {
                    err.status = 400;
                    next(err) ;
                }
                else res.status(200).json(result);
                uow.complete();
            }, id);
        }
    });
});

router.post('/login', function(req,res,next){
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
        } else {
            let data = new UserService(uow);
            let username = req.body.username;
            let password = req.body.password;
            data.getByUsernameAndPassword(function(resp){
                if(resp instanceof Error) {
                    res.status(401).json({"Error": "Wrong credentials, please try again!"});
                } else {
                    var payload = {
                        needsTfaCode: true,
                        tfaPassed: false,
                        userId: resp._id
                    };
                    switch(resp.role) {
                        case 1:
                        payload.role = 'admin';
                        break;
                        case 4:
                        payload.role = 'angajat';
                        break;
                    }
                    var token = jwt.sign(payload, config.secret, {
                        expiresIn: 1440
                    });
                    res.status(202).json({
                        "success:" : "User " + resp.username + " was logged in.",
                        "token": token
                    });
                }
            }, username, password);
        }
    });
});

router.post('/register', function(req,res,next){
    if(req.decoded.role != 'admin') return res.status(403).json({
        'error':'unauthorized',
        'message':'Only admins can access this route.'
    });
    if(!req.decoded.tfaPassed) {
        return res.status(403).json({
            'error':'unauthorized',
            'message':'2FA not passed.'
        });
    }
    let db = UnitOfWork.create((uow) => {
        if (uow instanceof Error) {
            next();
            // res.status(500).json({'Error' : "Internal server error : could not connect to the database!", "IssuedOn" : new Date()})
        } else {
            let data = new UserService(uow);
            debug('Body params', req.body);
            if (req.body.email &&
                req.body.username &&
                req.body.password &&
                req.body.sex && 
                req.body.accessCard) {
                        var userData = {
                        email: req.body.email,
                        username: req.body.username,
                        password: req.body.password,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        age: req.body.age,
                        cnp: req.body.cnp,
                        sex: req.body.sex,
                        position: req.body.position,
                        address: req.body.address,
                        role: req.body.role,
                        accessCard: req.body.accessCard,
                        createdAt : Date.now()
                    };
                    debug('User data',userData);
                    data.insertUser((result,err) => {
                        if(err) {
                            err.status = 400;
                            next(err) ;
                        }
                        else {
                            debug(result);
                            if(result.errmsg) {
                                res.status(400).json({error: "There is an account associated with this username / email."});
                            } else if (res.errors) {
                                res.status(400).json({error: "Please fill all the required data."});
                            } else {
                                res.status(200).json("User " + result.firstname + " " + result.lastname + " was registered successfuly!");
                            }
                        }
                        uow.complete();
                    }, userData);
                } else {
                    return res.status(400).json("Please fill out the form.");
                }
            }
      });
});

//generates 2fa code
router.post('/login/2fa', function(req,res,next) {
            var userCardCode = req.body.userCardCode;
            if(userCardCode) {
                res.status(200).json({
                    'tfa token': notp.totp.gen(userCardCode)
                });
            } else {
                res.status(400).json({
                    'success':false,
                    'message':'please insert a tfa token.'
                });
            }
    
});

//verifies 2fa code
router.post('/login/2fa/verify', function(req,res,next){
    console.log(req.decoded.userId);
    var uId = req.decoded.userId;
    var tfaCode = req.body.tfaCode;
    let db = UnitOfWork.create((uow) => {
        let mUow = uow;
        if (uow instanceof Error) {
            next();
            // res.status(500).json({'Error' : "Internal server error : could not connect to the database!", "IssuedOn" : new Date()})
        } else {
            var data = new UserService(uow);
            data.getById(function(ress,err){
                if(err) ress.status(404).json({
                    'success': false,
                    'message': 'invalid user id.'
                });
                if(ress.length != 0) {
                    debug(ress);
                    if(tfaCode) {
                        data.getAccessCodeByUsername(function(data) {
                            debug(data);
                            var login = notp.totp.verify(tfaCode, data[0].accessCard);
                            if(!login) {
                                res.status(403).json({
                                    'success': false,
                                    'message': 'invalid 2fa code!'
                                });
                            } else {
                                var payload = {
                                    needsTfaCode: false,
                                    tfaPassed: true,
                                    userId: uId
                                };
                                switch(ress[0].role) {
                                    case 1:
                                    payload.role = 'admin';
                                    break;
                                    case 4:
                                    payload.role = 'angajat';
                                    break;
                                }

                                var token = jwt.sign(payload, config.secret, {
                                    expiresIn: 1440
                                });

                                res.status(200).json({
                                    'success': true,
                                    'message': 'Successfully logged in!',
                                    'token' : token
                                });
                            }
                        }, ress[0].username);
                    } else {
                        res.status(400).json({
                            'success':false,
                            'message':'please enter tfa token.'
                        });
                    }
                } else {
                    res.status(404).json({
                        'success':false,
                        'message':'user not found.'
                    });
                }
            },uId);
        }});
});

module.exports = router;