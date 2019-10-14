const approval_msg = require('./approval_msg');
const slack_utils = require('./slack_utils');

// CldCvr Colors!
// #eb0011 - Gushing Red
// #f40072 - Hot Pink
// #ffac15 - Gold Yellow
// #fff213 - Bright Sunshine
// #28c72a - Grass Green (I hate that color!)
// #a0ef3d - Toxic Green
// #0083cc - Deep Sky
// #07b5ff - Clear Blue
// #3a4247 - Shuttle Bay Grey
// #252d30 - Steely Gran

const colors = {
    "SUCCESS": "#28c72a",
    "FAILURE": "#eb0011",
    "QUEUED": "#0083cc",
    "WORKING": "#07b5ff",
    "INTERNAL_ERROR": "#eb0011",
    "TIMEOUT": "#f40072",
    "CANCELLED": "#3a4247"
}

function getFailedStep(data) {
    let failedStep = undefined;
    for (let step of data.steps) {
        if (step.status === 'FAILURE') {
            failedStep = step;
            break;
        }
    }
    return failedStep;
}

const handleProductionDeployment = async (data, repo) => {
    let resText = undefined;
    let resColor = undefined;
    const LOGS = (name) => '<' + data.logUrl + '|' +  name + '>';
    const commitLink = '<' + repo.repoLink + 'commit/' + data.substitutions.SHORT_SHA 
            + '|' + repo.name + '/' + repo.productionCandidateBranch + '/' + data.substitutions.SHORT_SHA + '>'

    if (data.status === 'QUEUED') {
        resText = 'Production rollout `' + LOGS('queued') 
            + '` for ' + commitLink;
    } else if (data.status === 'WORKING') {
        resText = 'Production rollout in `' + LOGS('progress') 
            + '` for ' + commitLink;
        resColor = colors.QUEUED;
    } else if (data.status === 'SUCCESS') {
        resText = 'Production rollout `' + LOGS('successful') 
            + '` for ' + commitLink;
        resColor = colors.SUCCESS;
    } else if (data.status === 'FAILURE') {
        let failedStep = getFailedStep(data);
        resText = 'Production rollout `' + LOGS('failed') 
            + '` for ' + commitLink + ' in stage `' + failedStep.id + '`';
        resColor = colors.FAILURE;        
    }

    if (resText) await slack_utils.sendSlackMsg({
        'attachments': [{ 
            'fallback': resText,
            'text': resText,
            'color': resColor
        }]
    }, repo.channel);
}

const handleBranchAndPRBuilds = async (data, repo) => {
    let resText = undefined;
    let resColor = undefined;

    const LOGS = (name) => '<' + data.logUrl + '|' +  name + '>';

    let slug = '';

    if (data.substitutions._PR_NUMBER) {
        const PR_LINK =  '<' + repo.repoLink + 'pull/' + data.substitutions._PR_NUMBER 
                + '|' + repo.name + '/pull/' + data.substitutions._PR_NUMBER + '>';
        if (data.status === 'QUEUED' || data.status === 'FAILURE' || data.status === 'WORKING') slug = ' PR ' + PR_LINK;
        else if (data.status === 'SUCCESS') slug = 'PR ' + PR_LINK + '. PR is ready to be merged';
    } else {
        const COMMIT_LINK =  '<' + repo.repoLink + 'commit/' + data.substitutions.SHORT_SHA 
                + '|' + repo.name + '/' + data.substitutions.BRANCH_NAME + '/' + data.substitutions.SHORT_SHA +'>';
        slug = COMMIT_LINK;
    }

    if (data.status === 'QUEUED') {
        resText = 'Build `' + LOGS('queued') + '` for ' + slug;
        resColor = colors.QUEUED;
    } else if (data.status === 'WORKING') {
        resText = 'Build in `' + LOGS('progress') + '` for ' + slug;
        resColor = colors.QUEUED;
    } else if (data.status === 'SUCCESS') {
        resText = 'Build `' + LOGS('successful') + '` for ' + slug;
        resColor = colors.SUCCESS;
    } else if (data.status === 'FAILURE') {
        let failedStep = getFailedStep(data);
        resText = 'Build `' + LOGS('failed') + '` for ' + slug + ' in stage `' + failedStep.id + '`';
        resColor = colors.FAILURE;
    }

    if (resText) await slack_utils.sendSlackMsg({
        'attachments': [{ 
            'fallback': resText,
            'text': resText,
            'color': resColor
        }]
    }, repo.channel);

    if (data.status === 'SUCCESS' 
            && !data.substitutions._PR_NUMBER
            && repo.deploymentSourceBranch == data.substitutions.BRANCH_NAME) {
        const approvalInputMsg = 'Approve rollout to production for ' + slug + '?';
        const msg = approval_msg.msg(approvalInputMsg,{
            value: 'yes',
            repoName: repo.name,
            commit: data.substitutions.SHORT_SHA
        }, {
            value: 'no'
        });
        await slack_utils.sendSlackMsg({'blocks': msg}, repo.channel);
    }
}

module.exports = {
    handleBranchAndPRBuilds: handleBranchAndPRBuilds,
    handleProductionDeployment: handleProductionDeployment
}
