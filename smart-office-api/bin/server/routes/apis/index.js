const
    express = require('express'),
    v1Api = require('./v1'),
    v2Api = require('./v2');

let router = express.Router();

router.use('/v1', v1Api);
router.use('/v2', v2Api);

module.exports = router;