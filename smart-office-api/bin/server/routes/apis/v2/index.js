const   
    express = require('express');

let router = express.Router();

router.get('/', function(req,res){
    res.send("You accessed the API v2!");
})

module.exports = router;