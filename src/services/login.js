/*
 * Login Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/10/19
 */

const authService = require('./auth');
const usersService = require('./users');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Login Service');

const service = {};

/**
 * Creates a token for the user who logged in if
 * the login is successful.
 * 
 * @param {string} email User email
 * @param {string} password User password
 */
service.login = async (email, password) => {
  try {
    const user = await usersService.getByEmail(email);

    if (user.password !== helpers.hash(password)) {
      throw 'Passwords do not match.';
    }    

    return await authService.createToken(user);
  } catch (err) {
    log.error('login:', err);
    throw 'Invalid login credentials.';
  }
};

module.exports = service;
