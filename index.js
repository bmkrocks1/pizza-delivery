const worker = require('./src/worker');
const server = require('./src/server');

const app = {};

app.init = async () => {
  await worker.init();

  /*
    Initialize the HTTP and HTTPS servers.
  */
  server.init();
};

app.init();
