let prodConfig = {
    hostname: process.env.HOST_NAME || "localhost",
    port: process.env.PORT || 5000, 
    dbconfig : {
        dbType: 'mongodb',
        host: '@ds161148.mlab.com:61148',
        user: 'admin',
        password: 'Par0la01',
        database: 'intimesoftware'
    },
    secret: "DJKGSH09-=-dsf799FHDSUIOF"
};

module.exports = prodConfig;