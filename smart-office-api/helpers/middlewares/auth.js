const config = require('../../bin/config'),
      jwt = require('jsonwebtoken'),
      express = require('express');

var apiRoutes = express.Router(); 

apiRoutes.use(function(req, res, next) {
    var token = req.headers['x-access-token'];
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secret, function(err, decoded) {      
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });    
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;    
            next();
          }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });
    
      }
});

module.exports = apiRoutes;