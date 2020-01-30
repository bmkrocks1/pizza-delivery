/*
 * Login Route
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/10/19
 */

const loginService = require('../services/login');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Login Route');

const loginUser = async function(success, error) {
  try {
    const email = this.request.body && this.request.body.email;
    if (!email) {
      throw 'Missing email.';
    }

    const password = this.request.body && this.request.body.password;
    if (!password) {
      throw 'Missing password.';
    }

    const token = await loginService.login(email, password);

    log.info('loginUser: User has successfully logged in,', token);
    delete token.userId;
    delete token.userEmail;
    success({ token: token.id, expires: token.expires });
  } catch (err) {
    log.error('loginUser:', err);
    error(err);
  }
};

module.exports = {
  POST: helpers.promisifyHandler(loginUser)
};
