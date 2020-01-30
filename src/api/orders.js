/*
 * Orders Route
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/13/19
 */

const authService = require('../services/auth');
const ordersService = require('../services/orders');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Orders Route');

const getOrder = async function(success, error) {
  try {
    const orderId = this.request.query && this.request.query.id;
    if (!orderId) {
      throw 'Missing order ID.';
    }

    const order = await ordersService.getOwnOrderOfUser(this.loggedInUser.id, orderId);

    delete order.userId;
    delete order.userEmail;
    log.info('getOrder: Got order,', order);
    success(order);
  } catch (err) {
    log.error('getOrder:', err);
    error(err);
  }
};

module.exports = {
  GET: authService.withAuthentication(
    helpers.promisifyHandler(getOrder)
  )
};
