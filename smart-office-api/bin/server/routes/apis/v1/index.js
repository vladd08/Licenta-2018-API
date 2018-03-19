const   
    express = require('express'),
    usersController = require('../../../controllers/users');

let router = express.Router();

router.use('/users', usersController);

module.exports = router;