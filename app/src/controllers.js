const config = require('./../config')

function hello() { 
    return  { 
        msg: 'Hello Dublin, from home!', 
        environment: config.ENV_NAME
    }
};

module.exports = {
    hello: hello
}