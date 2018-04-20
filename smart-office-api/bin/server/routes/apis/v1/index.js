const   
    express = require('express'),
    usersController = require('../../../controllers/users'),
    projectsController = require('../../../controllers/projects');

let router = express.Router();

router.use('/users', usersController);
router.use('/projects', projectsController);

module.exports = router;