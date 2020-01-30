/*
 * Users Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/9/19
 */

const db = require('./_db');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Users Service');

const DIRECTORY = 'users';

const service = {};

/**
 * Creates a user.
 * 
 * @param {any} data Valid user data.
 */
service.create = async data => {
  try {
    const id = helpers.generateRandomStr();
    const password = helpers.hash(data.password);
    const user = Object.assign({}, data, { id, password  });

    await db.create(DIRECTORY, id, user);

    delete user.password;
    return user;
  } catch (err) {
    log.error('create:', err);
    throw 'Could not create the user.';
  }
};

/**
 * Retrieves a user by ID.
 * 
 * @param {string} id User ID
 */
service.getById = async id => {
  try {
    const user = await db.read(DIRECTORY, id);
    delete user.password;
    return user;
  } catch (err) {
    log.error('get:', err);
    throw 'Could not get the user.';
  }
};

/**
 * Retrieves a user by email.
 * 
 * @param {string} email User email
 */
service.getByEmail = async email => {
  try {
    const users = await db.listAsObjects(DIRECTORY);

    // find user with the given email
    const user = users.find(user => user.email === email);
    if (!user) {
      throw `Could not find the user with email ${email}`;
    }

    return user;
  } catch (err) {
    log.error('getByEmail:', err);
    throw 'Could not get the user.';
  }
};

/**
 * Updates a user.
 * 
 * @param {string} id User ID
 * @param {any} data Valid user data.
 */
service.update = async (id, data) => {
  try {
    const existingUser = await service.getById(id);
    const user = Object.assign({}, existingUser, data);

    if (user.password) {
      user.password = helpers.hash(user.password);
    }

    await db.update(DIRECTORY, id, user);

    delete user.password;
    return user;
  } catch (err) {
    log.error('update:', err);
    throw 'Could not update the user.';
  }
};

/**
 * Deletes a user.
 * 
 * @param {string} id User ID
 */
service.delete = async id => {
  try {
    await db.delete(DIRECTORY, id);
  } catch (err) {
    log.error('delete:', err);
    throw 'Could not delete the user.';
  }
};

module.exports = service;
