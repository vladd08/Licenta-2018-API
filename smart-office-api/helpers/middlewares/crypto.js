const crypto = require('bcrypt-nodejs');

class Crypto 
{
    static Hash(input,next) {
        crypto.hash(input,null,null,function(err, hash) {
            if (err) return next(err);
            else {
                return next(hash);
            }
        });
    }

    static Verify(input, hash, next) {
        crypto.compare(input, hash, function(err,res) {
            if(err) return next(err);
            else return next(res);
        });
    }

    static TfaHash(input,next) { 
        
    }
}

module.exports = Crypto;