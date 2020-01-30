/*
 * Auth Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/10/19
 */

const db = require('./_db');
const usersService = require('./users');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Auth Service');

const DIRECTORY = 'tokens';

const service = {};

/**
 * Retrieves a token.
 * 
 * @param {string} id Token ID
 */
service.getToken = async id => {
  try {
    return await db.read(DIRECTORY, id);
  } catch (err) {
    log.error('getToken:', err);
    throw 'Could not get the token.';
  }
};

/**
 * Retrieves a token by user ID.
 * 
 * @param {string} id User ID
 */
service.getTokenByUserId = async id => {
  try {
    const tokens = await db.listAsObjects(DIRECTORY);

    // find token with the given user ID
    return tokens.find(token => token.userId === id);
  } catch (err) {
    log.error('getTokenByUserId:', err);
    throw 'Could not get the token.';
  }
};

/**
 * Returns the token object if the token is found
 * and has not expired.
 * 
 * @param {string} token Token ID
 */
service.isLoggedIn = async tokenId => {
  try {
    const token = await service.getToken(tokenId);

    if (token.expires <= Date.now()) {
      throw 'Token has already expired.';
    }

    return token;
  } catch (err) {
    log.error('isLoggedIn:', err);
    throw 'Token is invalid.';
  }
};

/**
 * Creates a token.
 * 
 * @param {any} user The logged in user.
 */
service.createToken = async user => {
  try {
    // delete existing token
    const existingToken = await service.getTokenByUserId(user.id);
    if (existingToken) {
      await service.deleteToken(existingToken.id);
      log.info('createToken: Deleted existing token,', existingToken.id);
    }

    const token = {
      id: helpers.generateRandomStr(),
      userId: user.id,
      userEmail: user.email,
      expires: helpers.getOneHourFromNow()
    };

    await db.create(DIRECTORY, token.id, token);

    return token;
  } catch (err) {
    log.error('createToken:', err);
    throw 'Could not create the token.';
  }
};

/**
 * Deletes a token.
 * 
 * @param {string} token The logged in user's token.
 */
service.deleteToken = async token => {
  try {
    await db.delete(DIRECTORY, token);
  } catch (err) {
    log.error('deleteToken:', err);
    throw 'Could not delete the token.';
  }
};

/**
 * 
 * @param {Function} routeHandler
 */
service.withAuthentication = routeHandler => async request => {
  let loggedInUser = null;

  try {
    const tokenId = request.headers && request.headers.token;
    if (!tokenId) {
      throw 'Missing token.';
    }

    const token = await service.isLoggedIn(tokenId);
    loggedInUser = await usersService.getById(token.userId);
  } catch (err) {
    log.error('withAuthentication:', err);
    return {
      statusCode: 403,
      data: {
        message: 'Unauthorized access.'
      }
    };
  }

  log.debug('withAuthentication: Passing request data and logged-in user to route handler...');
  return await routeHandler(request, loggedInUser);
};

module.exports = service;
