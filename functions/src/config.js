const repos = require('./../repos')

const colors = {
    "SUCCESS": "#28c72a",
    "FAILURE": "#eb0011",
    "QUEUED": "#0083cc",
    "WORKING": "#07b5ff",
    "INTERNAL_ERROR": "#eb0011",
    "TIMEOUT": "#f40072",
    "CANCELLED": "#3a4247"
}

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
    SLACK_TOKEN: process.env.SLACK_BOT_TOKEN,
    GCP_PROJECT_ID: process.env.GCLOUD_PROJECT,
    colors: colors
}