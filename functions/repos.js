module.exports = {
    'gcp-cnci': {
        'name': 'gcp-cnci',
        'channel': 'gcp-cicd',
        'deploymentSourceBranch': 'master',
        'productionCandidateBranch': 'production-candidate',
        'repoLink': 'https://github.com/cldcvr/gcp-cnci/',
        'productionTriggerId': 'gcp-cnci-production-deploy-trigger',
        'stagingEnvUrl': 'http://35.240.202.244/',
        'productionEnvUrl': 'http://35.240.171.202/'
    }
}