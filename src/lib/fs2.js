const fs = require('fs');
const { promisify } = require('util');

const fs2 = {};

fs2.appendFile = promisify(fs.appendFile);
fs2.close = promisify(fs.close);
fs2.open = promisify(fs.open);
fs2.readdir = promisify(fs.readdir);
fs2.readFile = promisify(fs.readFile);
fs2.truncate = promisify(fs.truncate);
fs2.unlink = promisify(fs.unlink);
fs2.writeFile = promisify(fs.writeFile);

module.exports = fs2;
