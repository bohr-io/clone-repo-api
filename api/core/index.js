const lambda = require('lambda-api');

const api = lambda({
  cors: true,
  corsAllowOrigin: '*'
});

api.get('/', async (req, res) => {
  return { status: 'ok get' };
});

api.post('/', async (req, res) => {
  return { status: 'ok POST' };
});

api.post('/clone', async (req, res) => {
  const BOHR_CLONE_API_TOKEN = req.body.BOHR_CLONE_API_TOKEN;
  const GITHUB_TOKEN = req.body.GITHUB_TOKEN;
  const REPO_OWNER = req.body.REPO_OWNER;
  const REPO_NAME = req.body.REPO_NAME;

  if ((!process.env.BOHR_CLONE_API_TOKEN) || (process.env.BOHR_CLONE_API_TOKEN != BOHR_CLONE_API_TOKEN)) return { statusCode: 401 };

  return { status: 'ok clone' };
});

exports.handler = async (event, context) => {
  return await api.run(event, context);
};