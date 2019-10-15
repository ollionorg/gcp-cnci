const approval_msg = require('./approval_msg');
const slack_utils = require('./slack_utils');
const config = require('./config');
const {google} = require('googleapis');
const axios = require('axios');
let _ = require('lodash');

const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const imageDigest = async (imageId, tag) => {
    const authClient = await auth.getClient();
    const tokenRes = await authClient.getAccessToken();
    const apiConfig = { 
        headers: {
            'Authorization': 'Bearer ' + tokenRes.token
        }
    }

    const apiRes = await axios.get('https://gcr.io/v2/' 
        + config.GCP_PROJECT_ID + '/' 
        + imageId + '/tags/list', apiConfig);
    
    const image = apiRes.data;
    const req_digests = _.filter(
        Object.keys(image.manifest), 
        (digest) => {
            return image.manifest[digest].tag.length > 0 
                && image.manifest[digest].tag[0] == tag
        });
    if (req_digests.length > 0) {
        return req_digests[0];
    }
}

const imageUrl = async (imageId, tag) => {
    const digest = await imageDigest(imageId, tag);
    if (digest) {
        return 'https://gcr.io/' + config.GCP_PROJECT_ID  + '/'  +  imageId + '@' + digest;
    }
}

const sendApproval =  async (repo, cloudbuild_data) => {
    const commitLink =  '<' + repo.repoLink + 'commit/' + cloudbuild_data.substitutions.SHORT_SHA 
                + '|' + repo.name + '/' + cloudbuild_data.substitutions.BRANCH_NAME 
                + '/' + cloudbuild_data.substitutions.SHORT_SHA +'>';

    const approvalInputMsg = 'Approve rollout to production for ' + commitLink + '?';
    const msg = approval_msg.msg(approvalInputMsg,{
        value: 'yes',
        repoName: repo.name,
        commit: cloudbuild_data.substitutions.SHORT_SHA
    }, {
        value: 'no'
    });

    await slack_utils.sendSlackMsg({'blocks': msg}, repo.channel);
}

const scanProgress = async (repo, cloudbuild_data) => {
    const url = await imageUrl(repo.gcrImageId, cloudbuild_data.substitutions.SHORT_SHA);

    await slack_utils.sendSlackMsg({
        'attachments': [{ 
            'fallback': 'Image Vulnerability scan is in progress. Check result at ' + url,
            'text': 'Image vulnerability scan is in `progress`. You can check results <'+ url + '|here>'
        }]
    }, repo.channel);

    await sendApproval(repo, cloudbuild_data);
}

module.exports = {
    scanProgress: scanProgress
}