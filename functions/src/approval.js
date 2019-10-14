const slack_utils = require('./slack_utils')
const approval_msg = require('./approval_msg')
const rollout = require('./rollout').rollout
const config = require('./config')

async function onUserAction(userActionPayload, slack_context) {
    let action = userActionPayload.actions[0];
    if (action.blockId != approval_msg.block_id) {
        console.log('Actions of this block not supported');
        return;
    }

    if (new Date().getTime() - (1000 * userActionPayload.messageTs) >= 15 * 60 * 1000) {
        console.log('Action was posted before 15 mins, ignoring');
        await slack_utils.replaceAction(userActionPayload.responseUrl, 'This action has expired');
        return;
    }
    
    const payload = JSON.parse(action.value);
    if (payload.value == 'yes') {
        await slack_utils.replaceAction(userActionPayload.responseUrl, 'Roger that, rolling out to production');
        await rollout(config.getRepo(payload.repoName), payload.commit);
    } else {
        await slack_utils.replaceAction(userActionPayload.responseUrl, 'Rollout to production cancelled');
    }
}

function processAction(body) {
    return new Promise((resolve, reject) => {
        const userActionPayload = slack_utils.extractGenericAction(body);
        if (userActionPayload.type == slack_utils.ACTION_TYPE.OTHER) {
            resolve({});
            return;
        }
        onUserAction(userActionPayload, {}).then(() => resolve({})).catch(reject);
    });
}

module.exports = {
    processAction: processAction
}