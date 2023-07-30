const lambda = require('lambda-api');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const api = lambda({
  cors: true,
  corsAllowOrigin: '*'
});

api.post('/clone', async (req, res) => {
  const BOHR_CLONE_API_TOKEN = req.body.BOHR_CLONE_API_TOKEN;
  const GITHUB_TOKEN = req.body.GITHUB_TOKEN;
  const REPO_OWNER = req.body.REPO_OWNER;
  const REPO_NAME = req.body.REPO_NAME;

  if ((!process.env.BOHR_CLONE_API_TOKEN) || (process.env.BOHR_CLONE_API_TOKEN != BOHR_CLONE_API_TOKEN)) return { statusCode: 401 };

  if (REPO_OWNER == 'bohr-repos') return { statusCode: 200 };

  const dest_repo = REPO_OWNER + '-' + REPO_NAME;

  const access_token = process.env.GH_ACCESS_TOKEN;
  const headers = {
    'accept': 'application/vnd.github+json',
    'Authorization': 'token ' + access_token,
    'user-agent': 'bohr-api-lambda'
  };

  await fetch(
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

  await fetch(
    'https://api.github.com/repos/bohr-repos/' + dest_repo + '/dispatches',
    {
      method: 'POST',
      body: JSON.stringify({
        event_type: 'bohr-clone-event',
        client_payload: {
          GITHUB_TOKEN: GITHUB_TOKEN,
          REPO_OWNER: REPO_OWNER,
          REPO_NAME: REPO_NAME
        }
      }),
      headers: headers
    }
  );

  return { status: 'ok' };
});

exports.handler = async (event, context) => {
  return await api.run(event, context);
};