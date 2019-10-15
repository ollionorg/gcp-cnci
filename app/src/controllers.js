const config = require('./../config')

function hello() { 
    return  { 
        msg: 'hello, CldCvr!', 
        environment: config.ENV_NAME
    }
};

module.exports = {
    hello: hello
}