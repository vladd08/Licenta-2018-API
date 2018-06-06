const
    express = require('express'),
    http = require('http'),
    debug = require('debug')('smart-office-api:server');

module.exports = function () {
    let server = express(),
        create,
        start;

    create = function (config) {
        let routes = require('./routes');

        //Server settings
        server.set('env', config.env);
        server.set('port', config.port);
        server.set('hostname', config.hostname);
        server.set('view engine', 'jade');

        routes.init(server);
    };

    start = function () {
        let hostname = server.get('hostname'),
            port = server.get('port');

        http.createServer(server).listen(port, function () {
            debug('Express server listening on - http://' + hostname + ':' + port);
        });
    };

    return {
        create: create,
        start: start
    };
};