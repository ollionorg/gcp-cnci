const assert = require('assert');
const axios = require('axios');
const STAGING_DEPLOYMENT_API_URL = require('./config').API_BASE;

// Constants
const HOME_API_EXPECTED_MSG = 'Hello, Singapore!';
const STAGING_ENVIRONMENT_NAME = 'staging';

const HELLO_API = () => axios.get(STAGING_DEPLOYMENT_API_URL + '/hello');

describe('API Integration Tests', function() {
  describe('APIs', function() {

    it('\'/hello\' should return correct environment!', function() {
      return HELLO_API().then(response => {
        assert.equal(response.status, 200)
        assert.equal(response.data.environment, STAGING_ENVIRONMENT_NAME)
      })
    });

    it('\'/hello\' should return 200 and Hello World!', function() {
        return HELLO_API().then(response => {
          assert.equal(response.status, 200)
          assert.equal(response.data.msg, HOME_API_EXPECTED_MSG)
        })
    });
  });
});