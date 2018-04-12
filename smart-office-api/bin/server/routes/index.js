const   
    apiRoute = require('./apis'),
    homeRoute = require('./home'),
    errorRoute = require('./error'),
    parser = require('body-parser'),
    helmet = require('helmet'),
    debug = require('debug')('smart-office-api:server'),
    cors = require('cors'),
    compression = require('compression');

function init(server) {
    server.get('*', function (req, res, next) {
        debug('Request was made to: ' + req.originalUrl);
        return next();
    });

    server.use(cors());
    server.use(helmet());
    server.use(compression());
    server.use(parser.json());
    server.use('/api', apiRoute);
    server.use('/home', homeRoute);
    server.use('/error', errorRoute);
    server.get('/', function (req,res){
        res.redirect('/home');
    });

    if (server.get('env') === 'development') {
        server.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: err
            });
        });
    } else {
        server.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: err
            });
        });
    }
}

module.exports = {
    init: init
};