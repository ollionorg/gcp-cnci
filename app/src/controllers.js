const config = require('./../config')

function hello() { 
    return  { 
        msg: 'hello, World!', 
        environment: config.ENV_NAME
    }
};

module.exports = {
    hello: hello
}