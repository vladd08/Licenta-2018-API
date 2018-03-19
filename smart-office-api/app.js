var express = require('express');

const 
    server = require('./bin/server')(),
    config = require('./bin/config');

server.create(config);
server.start();
