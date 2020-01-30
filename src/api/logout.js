/*
 * Logout Route
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/10/19
 */

const authService = require('../services/auth');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Logout Route');

const logoutUser = async function(success, error) {
  try {
    const token = this.request.headers && this.request.headers.token;
    if (!token) {
      throw 'Missing token.';
    }

    await authService.deleteToken(token);

    log.info('logoutUser: User has successfully logged out.');
    success();
  } catch (err) {
    log.error('logoutUser:', err);
    error(err);
  }
};

module.exports = {
  GET: helpers.promisifyHandler(logoutUser)
};
