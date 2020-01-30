/*
 * Cart Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/12/19
 */

const db = require('./_db');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Cart Service');

const DIRECTORY = 'carts';

const service = {};

/**
 * Creates a cart.
 * 
 * Every user can only have one cart so if a user has
 * an existing cart, it will be deleted before creating
 * this new cart.
 * 
 * @param {any} data Valid cart data.
 * @param {any} owner User data.
 */
service.create = async (data, owner) => {
  try {
    // delete existing cart
    const existingCart = await service.getCartByUserId(owner.id);
    if (existingCart) {
      await service.delete(existingCart.id);
      log.info('create: Deleted existing cart,', existingCart.id);
    }

    const id = helpers.generateRandomStr();
    const cart = Object.assign({}, data, {
      id,
      createdDate: Date.now(),
      userId: owner.id,
      userEmail: owner.email
    });

    await db.create(DIRECTORY, id, cart);

    return cart;
  } catch (err) {
    log.error('create:', err);
    throw 'Could not create the cart.';
  }
};

/**
 * Retrieves a cart by ID.
 * 
 * @param {string} id Cart ID
 */
service.getById = async id => {
  try {
    return await db.read(DIRECTORY, id);
  } catch (err) {
    log.error('getById:', err);
    throw 'Could not get the cart.';
  }
};

/**
 * Retrieves a cart by user ID.
 * 
 * @param {string} id User ID
 */
service.getCartByUserId = async id => {
  try {
    const carts = await db.listAsObjects(DIRECTORY);
    if (!carts || carts.length === 0) {
      return null;
    }

    // find cart with the given user ID
    const cart = carts.find(cart => cart.userId === id);

    if (!cart) {
      return null;
    }

    return cart;
  } catch (err) {
    log.error('getCartByUserId:', err);
    throw 'Could not get the cart.';
  }
};

/**
 * Retrieves the cart owned by user
 * with the specified user ID.
 * 
 * @param {string} userId User ID.
 * @param {string} cartId Cart ID.
 */
service.getOwnCartOfUser = async (userId, cartId) => {
  const cart = await service.getCartByUserId(userId);
  if (!cart || cart.id !== cartId) {
    throw `Cart with id "${cartId}" not found for this user.`;
  }
  return cart;
};

/**
 * Updates a cart.
 * 
 * @param {string} id Cart ID
 * @param {any} data Valid cart data.
 */
service.update = async (id, data) => {
  try {
    const existingCart = await service.getById(id);
    const cart = Object.assign({}, existingCart, data);

    await db.update(DIRECTORY, id, cart);

    return cart;
  } catch (err) {
    log.error('update:', err);
    throw 'Could not update the cart.';
  }
};

/**
 * Deletes a cart.
 * 
 * @param {string} id Cart ID.
 */
service.delete = async id => {
  try {
    await db.delete(DIRECTORY, id);
  } catch (err) {
    log.error('delete:', err);
    throw 'Could not delete the cart.';
  }
};

module.exports = service;
