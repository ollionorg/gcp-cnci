const config = require('./../config')

function hello() { 
    return  { 
        msg: 'Hello Dublin !!!', 
        environment: config.ENV_NAME
    }
};

module.exports = {
    hello: hello
}