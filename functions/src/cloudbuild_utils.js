const slack_utils = require('./slack_utils');
const scanning = require('./scanning');
const config = require('./config')

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
        resColor = config.colors.QUEUED;
    } else if (data.status === 'SUCCESS') {
        resText = 'Production rollout `' + LOGS('successful') 
            + '` for ' + commitLink;

        if (data.status === 'SUCCESS') {
            resText = resText + '\n Click <' + repo.productionEnvUrl + '|here> to go to production environment'
        }

        resColor = config.colors.SUCCESS;
    } else if (data.status === 'FAILURE') {
        let failedStep = getFailedStep(data);
        resText = 'Production rollout `' + LOGS('failed') 
            + '` for ' + commitLink + ' in stage `' + failedStep.id + '`';
        resColor = config.colors.FAILURE;        
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
        if (data.status === 'QUEUED' || data.status === 'FAILURE' || data.status === 'WORKING') slug = 'pull request ' + PR_LINK;
        else if (data.status === 'SUCCESS') slug = 'pull request ' + PR_LINK + ', ready to merge!';
    } else {
        const commitLink =  '<' + repo.repoLink + 'commit/' + data.substitutions.SHORT_SHA 
                + '|' + repo.name + '/' + data.substitutions.BRANCH_NAME + '/' + data.substitutions.SHORT_SHA +'>';
        slug = commitLink;

        if (data.status === 'SUCCESS') {
            slug = slug + '\n Click <' + repo.stagingEnvUrl + '|here> to go to staging environment'
        }
    }

    if (data.status === 'QUEUED') {
        resText = 'Build `' + LOGS('queued') + '` for ' + slug;
        resColor = config.colors.QUEUED;
    } else if (data.status === 'WORKING') {
        resText = 'Build in `' + LOGS('progress') + '` for ' + slug;
        resColor = config.colors.QUEUED;
    } else if (data.status === 'SUCCESS') {
        resText = 'Build `' + LOGS('successful') + '` for ' + slug;
        resColor = config.colors.SUCCESS;
    } else if (data.status === 'FAILURE') {
        let failedStep = getFailedStep(data);
        resText = 'Build `' + LOGS('failed') + '` for ' + slug + ' in stage `' + failedStep.id + '`';
        resColor = config.colors.FAILURE;
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
        await scanning.scanProgress(repo, data);
    }
}

module.exports = {
    handleBranchAndPRBuilds: handleBranchAndPRBuilds,
    handleProductionDeployment: handleProductionDeployment
}
