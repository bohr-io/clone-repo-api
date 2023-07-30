const lambda = require('lambda-api');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const api = lambda({
  cors: true,
  corsAllowOrigin: '*'
});

api.post('/clone', async (req, res) => {

  console.log('POST /clone');

  try {
    const BOHR_CLONE_API_TOKEN = req.body.BOHR_CLONE_API_TOKEN;
    const GITHUB_ACCESS_TOKEN = req.body.githubAccessToken;
    const GITHUB_APPLICATION_TOKEN = req.body.githubApplicationToken;
    const REPO_OWNER = req.body.REPO_OWNER;
    const REPO_NAME = req.body.REPO_NAME;

    if ((!process.env.BOHR_CLONE_API_TOKEN) || (process.env.BOHR_CLONE_API_TOKEN != BOHR_CLONE_API_TOKEN)) return { statusCode: 401 };

    if ((REPO_OWNER == 'bohr-repos') || (REPO_OWNER == 'bohr-io')) return { statusCode: 200 };

    const dest_repo = REPO_OWNER + '-' + REPO_NAME;

    const access_token = process.env.GH_ACCESS_TOKEN;
    const headers = {
      'accept': 'application/vnd.github+json',
      'Authorization': 'token ' + access_token,
      'user-agent': 'bohr-api-lambda'
    };

    const response_generate = await fetch(
      'https://api.github.com/repos/bohr-repos/base/generate',
      {
        method: 'POST',
        body: JSON.stringify({
          owner: 'bohr-repos',
          name: dest_repo,
          private: true
        }),
        headers: headers
      }
    );

    await new Promise(s => setTimeout(s, 6000));

    const response_dispatches = await fetch(
      'https://api.github.com/repos/bohr-repos/' + dest_repo + '/dispatches',
      {
        method: 'POST',
        body: JSON.stringify({
          event_type: 'bohr-clone-event',
          client_payload: {
            GITHUB_ACCESS_TOKEN: GITHUB_ACCESS_TOKEN,
            GITHUB_APPLICATION_TOKEN: GITHUB_APPLICATION_TOKEN,
            REPO_OWNER: REPO_OWNER,
            REPO_NAME: REPO_NAME
          }
        }),
        headers: headers
      }
    );

    return {
      status: 'ok',
      generate: response_generate.status,
      dispatches: response_dispatches.status
    };
      
  } catch (error) {
    console.error(error);
    return { status: 'fail' };
  }
});

exports.handler = async (event, context) => {
  return await api.run(event, context);
};