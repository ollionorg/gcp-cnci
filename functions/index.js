const cloudbuild_utils = require('./src/cloudbuild_utils');
const config = require('./src/config')
const approval = require('./src/approval')

const eventToBuild = (data) => {
    return JSON.parse(new Buffer(data, 'base64').toString());
}

function isDuplicate(req) {
    if (req.headers['x-slack-retry-num']) {
        // this is a retry, don't process. TODO: find a better solution
        console.log('Message was retried, ignoring');
        return true;
    }
    return false;
}

exports.gcpCiCdSlackEvents = (event, context) => {
    const build = eventToBuild(event.data);
    console.log(JSON.stringify(build));
    const repo = config.getRepo(build.substitutions.REPO_NAME)

    if (repo && build.substitutions.TAG_NAME) {
        cloudbuild_utils.handleProductionDeployment(build, repo)
            .then(() => {}).catch(err => console.log(err));
    } else if (repo) {
        cloudbuild_utils.handleBranchAndPRBuilds(build, repo).then(()=>{});
    }
};

exports.gcpCiCdApprovalAction = (req, res) => {
    if (isDuplicate(req)) {
        res.sendStatus(200);
        return;
    }

    if (req.method === 'POST') {
        approval.processAction(req.body).then(() => {});
    }
    res.sendStatus(200);
}