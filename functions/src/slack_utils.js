const config = require('./config');
const axios = require('axios');
const { WebClient, ErrorCode } = require('@slack/web-api');
const slack_bot_web = new WebClient(config.SLACK_TOKEN);

const ACTION_TYPE = {
    BLOCK_ACTION: 1,
    OTHER: -1
}

async function sendSlackMsg(response, conversationId) {
    try {
        if (response.text || response.blocks || response.attachments) {
            const payload = {
                channel: conversationId,
            };
            if (response.blocks) payload.blocks = response.blocks;
            else payload.text = response.text;

            if (response.attachments) payload.attachments = response.attachments;
            
            const result = await slack_bot_web.chat.postMessage(payload);
            console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);   
        }
    } catch (error) {
        if (error.code === ErrorCode.PlatformError) {
            console.log(error.data);
        } else {
            console.log('Well, that was unexpected.');
            console.log(error);
        }
        const errorPayload = {
            channel: conversationId,
            text: 'Encountered an error while psoting the result of the operation'
        };
        await slack_bot_web.chat.postMessage(errorPayload);
        throw error;
    }
}

async function replaceAction(responseUrl, text) {
    try {
        const msg = {
            'replace_original': 'true',
            'text': '> ' + text
        }
        await axios.post(responseUrl, msg);
    } catch(err) {
        console.log('Error occured while replacing the action');
        console.log(err);
    }
}

function extractGenericAction(body) {
    const payload = JSON.parse(body.payload);
    const actions = [];
    for (let action of payload.actions) {
        const newAction = {};
        newAction.actionId = action.action_id;
        newAction.blockId = action.block_id;
        newAction.actionTs = action.action_ts;
        newAction.type = action.type;        

        if (action.type == 'button') {
            newAction.text = action.text.text;
            newAction.value = action.value;
        } else if (action.type == 'static_select') {
            newAction.text = action.selected_option.text.text;
            newAction.value = action.selected_option.value;
        }

        actions.push(newAction);
    }

    let type = ACTION_TYPE.OTHER;
    if (payload.type == 'block_actions') {
        type = ACTION_TYPE.BLOCK_ACTION;
    }
    
    return {
        type: type,
        actions: actions,
        channel: payload.channel.id,
        responseUrl: payload.response_url,
        messageTs: payload.message.ts
    }
}

module.exports = {
    sendSlackMsg: sendSlackMsg,
    extractGenericAction: extractGenericAction,
    replaceAction: replaceAction,
    ACTION_TYPE: ACTION_TYPE
}