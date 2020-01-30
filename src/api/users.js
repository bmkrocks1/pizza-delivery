/*
 * Users Route
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/9/19
 */

const authService = require('../services/auth');
const usersService = require('../services/users');
const userValidator = require('../validators/user');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Users Route');

const createUser = async function(success, error) {
  try {
    const data = userValidator.toCreate(this.request.body);
    const user = await usersService.create(data);

    log.info('createUser: User created,', user);
    success(user, 201);
  } catch (err) {
    log.error('createUser:', err);
    error(err);
  }
};

const getUserById = async function(success, error) {
  try {
    const id = this.request.query && this.request.query.id;
    if (!id) {
      throw 'Missing ID.';
    }

    const user = await usersService.getById(id);

    if (this.loggedInUser.id !== id) {
      throw 'Could not get the user.'
    }

    log.info('getUser: Got user,', user);
    success(user);
  } catch (err) {
    log.error('getUser:', err);
    error(err);
  }
};

const updateUser = async function(success, error) {
  try {
    const id = this.request.query && this.request.query.id;
    if (!id) {
      throw 'Missing ID.';
    }

    if (this.loggedInUser.id !== id) {
      throw 'Could not get the user.'
    }

    const data = userValidator.toUpdate(this.request.body);
    const user = await usersService.update(id, data);

    log.info('updateUser: User updated,', user);
    success(user);
  } catch (err) {
    log.error('updateUser:', err);
    error(err);
  }
};

const deleteUser = async function(success, error) {
  try {
    const id = this.request.query && this.request.query.id;
    if (!id) {
      throw 'Missing ID.';
    }

    if (this.loggedInUser.id !== id) {
      throw 'Could not get the user.'
    }

    await usersService.delete(id);

    log.info('deleteUser: User deleted,', id);
    success();
  } catch (err) {
    log.error('deleteUser:', err);
    error(err);
  }
};

module.exports = {
  POST: helpers.promisifyHandler(createUser),
  GET: authService.withAuthentication(
    helpers.promisifyHandler(getUserById)
  ),
  PUT: authService.withAuthentication(
    helpers.promisifyHandler(updateUser)
  ),
  DELETE: authService.withAuthentication(
    helpers.promisifyHandler(deleteUser)
  )
};
