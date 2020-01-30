const config = require('../config');
const helpers = require('./helpers');

const LOG_LEVELS = ['off', 'error', 'warn', 'info', 'debug'];

const COLOR_CODE = {
  debug: '\x1b[34m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m'
};

const CONFIG_LOG_LEVEL = config.logLevel
  ? config.logLevel.toLowerCase()
  : 'debug';

const CONFIG_LOG_LEVEL_IDX = LOG_LEVELS.indexOf(CONFIG_LOG_LEVEL);

module.exports = function Logger(name) {
  const debug = (...objects) => {
    _log('debug', objects);
  };

  const info = (...objects) => {
    _log('info', objects);
  };

  const warn = (...objects) => {
    _log('warn', objects);
  };

  const error = (...objects) => {
    _log('error', objects);
  };

  const line = length => {
    length = length || 30;
    console.log.apply(console, Array(length).fill('-'));
  };

  // private log function
  // e.g. 2019-12-05 17:03:44  DEBUG [Server] init:
  // e.g. 2019-12-05 17:03:44   INFO [Users Service] getUser: 
  // e.g. 2019-12-05 17:03:44   WARN [Server] init:
  // e.g. 2019-12-05 17:03:44  ERROR [Users Service] createUser:
  const _log = (level, objects) => {
    const index = LOG_LEVELS.indexOf(level);

    if (index <= CONFIG_LOG_LEVEL_IDX) {
      const args = [
        // Date & Time string if enabled
        config.logDate ? helpers.getCurrentDateTimeString().padEnd(19) : '',

        // Log Level
        `${COLOR_CODE[level]}${level.toUpperCase()}\x1b[0m`.padStart(14),

        // Logger Name
        name ? `[\x1b[32m${name}\x1b[0m]` : ''
      ].concat(objects);

      console.log.apply(console, args);
    }
  };

  return { debug, info, warn, error, line };
};
