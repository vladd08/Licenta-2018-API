const   
    express = require('express'),
    usersController = require('../../../controllers/users'),
    projectsController = require('../../../controllers/projects'),
    hoursController = require('../../../controllers/hours');

let router = express.Router();

router.use('/users', usersController);
router.use('/projects', projectsController);
router.use('/hours', hoursController);

module.exports = router;