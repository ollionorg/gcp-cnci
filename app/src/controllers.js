const config = require('./../config')

function hello() { 
    return  { 
        msg: 'Hello, World!!', 
        environment: config.ENV_NAME
    }
};

module.exports = {
    hello: hello
}