/*
 * Cart Route
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/12/19
 */

const authService = require('../services/auth');
const cartsService = require('../services/cart');
const cartValidator = require('../validators/cart');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Cart Route');

const createCart = async function(success, error) {
  try {
    const owner = this.loggedInUser;
    const data = cartValidator.toCreateOrUpdate(this.request.body);
    const cart = await cartsService.create(data, owner);

    log.info('createCart: Cart created,', cart);
    delete cart.userId;
    delete cart.userEmail;
    success(cart, 201);
  } catch (err) {
    log.error('createCart:', err);
    error(err);
  }
};

const getCart = async function(success, error) {
  try {
    const cartId = this.request.query && this.request.query.id;
    if (!cartId) {
      throw 'Missing cart ID.';
    }

    const cart = await cartsService.getOwnCartOfUser(this.loggedInUser.id, cartId);

    delete cart.userId;
    delete cart.userEmail;
    log.info('getUser: Got cart,', cart);
    success(cart);
  } catch (err) {
    log.error('getCart:', err);
    error(err);
  }
};

const updateCart = async function(success, error) {
  try {
    const cartId = this.request.query && this.request.query.id;
    if (!cartId) {
      throw 'Missing cart ID.';
    }

    await cartsService.getOwnCartOfUser(this.loggedInUser.id, cartId);

    const data = cartValidator.toCreateOrUpdate(this.request.body);
    const cart = await cartsService.update(cartId, data);

    log.info('updateCart: Cart updated,', cart);
    delete cart.userId;
    delete cart.userEmail;
    success(cart);
  } catch (err) {
    log.error('updateCart:', err);
    error(err);
  }
};

const deleteCart = async function(success, error) {
  try {
    const cartId = this.request.query && this.request.query.id;
    if (!cartId) {
      throw 'Missing cart ID.';
    }

    const cart = await cartsService.getOwnCartOfUser(this.loggedInUser.id, cartId);
    await cartsService.delete(cart.id);

    log.info('deleteCart: Cart deleted,', cartId);
    success();
  } catch (err) {
    log.error('deleteCart:', err);
    error(err);
  }
};

module.exports = {
  POST: authService.withAuthentication(
    helpers.promisifyHandler(createCart)
  ),
  GET: authService.withAuthentication(
    helpers.promisifyHandler(getCart)
  ),
  PUT: authService.withAuthentication(
    helpers.promisifyHandler(updateCart)
  ),
  DELETE: authService.withAuthentication(
    helpers.promisifyHandler(deleteCart)
  )
};
