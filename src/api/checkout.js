/*
 * Checkout Route
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/17/19
 */

const authService = require('../services/auth');
const cartsService = require('../services/cart');
const checkoutService = require('../services/checkout');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Checkout Route');

const checkoutCart = async function(success, error) {
  try {
    const cartId = this.request.query && this.request.query.cart_id;
    if (!cartId) {
      throw 'Missing cart ID.';
    }

    // Get cart of the logged in user
    const owner = this.loggedInUser;
    const cart = await cartsService.getOwnCartOfUser(owner.id, cartId);

    // Checkout the cart and create an order
    const order = await checkoutService.checkout(cart, owner);
    log.info('checkoutCart: Order created,', order);

    success(order, 201);
  } catch (err) {
    log.error('checkoutCart:', err);
    error(err);
  }
};

module.exports = {
  POST: authService.withAuthentication(
    helpers.promisifyHandler(checkoutCart)
  )
};
