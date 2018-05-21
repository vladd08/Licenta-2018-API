const
    _ = require('lodash')
env = process.env.NODE_ENV || 'development',
    envConfig = require('./' + env);


let defaultConfig = {
    env: env
};

module.exports = _.merge(defaultConfig, envConfig);