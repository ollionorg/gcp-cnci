const repos = require('./../repos')

function getRepo(name) {
    let req_repo = undefined;
    for(let repo of Object.keys(repos)){
        if (repos[repo].name == name) {
            req_repo = repos[repo];
            break;
        }
    }
    return req_repo;
}

module.exports = {
    getRepo: getRepo,
    SLACK_TOKEN: process.env.SLACK_BOT_TOKEN
}