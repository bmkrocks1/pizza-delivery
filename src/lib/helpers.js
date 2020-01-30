const crypto = require('crypto');
const config = require('../config');

const helpers = {};

/**
 * Returns current date and time formatted to a specified format.
 * 
 * @param {string} format Optional format. Default: `YYYY-MM-DD HH:mm:ss`
 */
helpers.getCurrentDateTimeString = format => {
  format = format || 'YYYY-MM-DD HH:mm:ss';
  const DATE_METHOD = {
    'YYYY': 'getFullYear',
    'MM': 'getMonth',
    'DD': 'getDate',
    'HH': 'getHours',
    'mm': 'getMinutes',
    'ss': 'getSeconds'
  };
  const now = new Date();
  const regex = /(YYYY|MM|DD|HH|mm|ss)/g;
  return format.replace(regex, token => ('' + now[DATE_METHOD[token]]()).padStart(token.length, '0'));
};

/**
 * Returns the time in milliseconds that is one hour from now.
 */
helpers.getOneHourFromNow = () => Date.now() + 1000 * 60 * 60;

/**
 * Generates a random 32-char string.
 */
helpers.generateRandomStr = () => crypto.randomBytes(16).toString('hex');

/**
 * Hashes the string argument.
 * 
 * @param {string} str The string to hash.
 */
helpers.hash = str =>
  crypto
    .createHmac('sha256', config.hashingSecret)
    .update(str)
    .digest('hex');

/**
 * `JSON.parse` the string argument. If an exception is thrown while parsing,
 * returns an empty object literal.
 * 
 * @param {string} str The string to parse.
 */
helpers.parse = str => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return {};
  }
};

/**
 * Returns a version of the HTTP method handler that returns a Promise.
 * 
 * @param {Function} handler The HTTP method handler.
 */
helpers.promisifyHandler = handler => {
  return (request, loggedInUser) => new Promise(resolve => {
    loggedInUser = loggedInUser || null;
    
    const success = (data, statusCode) => {
      resolve({
        statusCode: statusCode || 200,
        data
      });
    };

    const error = (msg, statusCode) => {
      resolve({
        statusCode: statusCode || 400,
        data: { 
          message: msg
        }
      });
    };

    handler.call({ request, loggedInUser }, success, error);
  });
};

/**
 * Parses the str argument and returns a floating point number.
 * If the str cannot be parsed, instead returns 0.
 * 
 * @param {string} str The string to parse.
 */
helpers.parseFloat = str => {
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

/**
 * Returns a new string without the double quotes
 * wrapping the argument str if there is any.
 * 
 * @param {string} str The string to unquote.
 */
helpers.unquote = str => {
  // check if str is wrapped in double quotes
  if (/^".*?"$/.test(str)) {
    // unquote str
    return str.replace(/^"|"$/g, '');
  } else {
    return str;
  }
};

module.exports = helpers;
