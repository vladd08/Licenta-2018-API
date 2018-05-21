const
    express = require('express');

let router = express.Router();

router.get('/', function (req, res) {
    res.json({ "Response": "Welcome to the API's home path." });
});

module.exports = router;