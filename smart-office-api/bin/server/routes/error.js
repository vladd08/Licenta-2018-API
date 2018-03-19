const
    express = require('express');

let router = express.Router();

router.get('/', function(req,res){
    res.send("Well.. That was some nasty error!");
});

module.exports = router;