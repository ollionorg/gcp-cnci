const {google} = require('googleapis');
const cloudbuild = google.cloudbuild('v1');

const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

async function rollout(repo, commit) {
    const authClient = await auth.getClient();
    const project = await auth.getProjectId();
    
    await cloudbuild.projects.triggers.run({
        projectId: project,
        auth: authClient,
        triggerId: repo.productionTriggerId,
        requestBody: {
            tagName: 'release-' + commit
        }
    })
}

module.exports = {
    rollout: rollout
}