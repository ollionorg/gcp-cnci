const config = require('./../config')

function hello() { 
    return  { 
        msg: 'Hello, Singapore!', 
        environment: config.ENV_NAME
    }
};

module.exports = {
    hello: hello
}