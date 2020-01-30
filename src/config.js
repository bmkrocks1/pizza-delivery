const env = {};

env.dev = {
  httpPort: 3000,
  httpsPort: 3001,
  hashingSecret: 'secret',
  logLevel: 'debug',
  logDate: false
};

env.prod = {
  httpPort: 5000,
  httpsPort: 5001,
  hashingSecret: 'secret',
  logLevel: 'warn',
  logDate: true
};

const passedEnv = process.env.NODE_ENV
  ? process.env.NODE_ENV.toLowerCase()
  : 'dev';

module.exports = env[passedEnv] || env.dev;
