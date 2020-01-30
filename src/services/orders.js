/*
 * Orders Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/13/19
 */

const db = require('./_db');
const helpers = require('../lib/helpers');
const menuService = require('./menu');
const log = require('../lib/logger')('Orders Service');

const DIRECTORY = 'orders';

const service = {};

/**
 * TO_PAY      = The order is created and payment has yet to be made.
 * TO_DELIVER  = Payment is received and delivery will be made.
 * DELIVERING  = Delivery is on its way.
 * COMPLETE    = Delivery is accepted and the order is complete.
 */
service.ORDER_STATUS = Object.freeze({
  TO_PAY: 'to_pay',
  TO_DELIVER: 'to_deliver',
  DELIVERING: 'delivering',
  COMPLETE: 'complete'
});

/**
 * Creates an order from a cart data but does not write
 * the data to a file.
 * 
 * @param {any} cartData Valid cart data.
 * @param {any} owner User data.
 */
service.create = async (cartData, owner) => {
  try {
    const id = helpers.generateRandomStr();
    const order = Object.assign({}, cartData, {
      id,
      orderedDate: Date.now(),
      userId: owner.id,
      userEmail: owner.email
    });

    let totalAmount = 0;
    let totalQuantity = 0;

    order.items = await Promise.all(
      order.items.map(async orderItem => {
        const { itemId, quantity } = orderItem;
        const item = await menuService.getItem(itemId);
        const amount = item.price * quantity;

        totalAmount += amount;
        totalQuantity += quantity;

        return { item, quantity, amount };
      })
    );

    order.totalAmount = totalAmount;
    order.totalQuantity = totalQuantity;
    order.status = service.ORDER_STATUS.TO_PAY;

    return order;
  } catch (err) {
    log.error('create:', err);
    throw 'Could not create the order.';
  }
};

/**
 * Retrieves an order by ID.
 * 
 * @param {string} id Order ID
 */
service.getById = async id => {
  try {
    return await db.read(DIRECTORY, id);
  } catch (err) {
    log.error('getById:', err);
    throw 'Could not get the order.';
  }
};

/**
 * Retrieve orders by user ID.
 * 
 * @param {string} id User ID
 */
service.getOrdersByUserId = async id => {
  try {
    const orders = await db.listAsObjects(DIRECTORY);

    // find orders with the given user ID
    const userOrders = orders.filter(order => order.userId === id);

    return userOrders;
  } catch (err) {
    log.error('getOrdersByUserId:', err);
    throw 'Could not get the orders.';
  }
};

/**
 * Retrieves a specific order owned by user
 * with the specified user ID.
 * 
 * @param {string} userId User ID.
 * @param {string} orderId Order ID.
 */
service.getOwnOrderOfUser = async (userId, orderId) => {
  const orders = await service.getOrdersByUserId(userId);
  if (!orders || orders.length === 0) {
    throw `Order with id "${orderId}" not found for this user.`;
  }

  const order = orders.find(order => order.id === orderId);
  if (!order) {
    throw `Order with id "${orderId}" not found for this user.`;
  }

  return order;
};

/**
 * Saves or updates an order.
 */
service.save = async order => {
  // TODO: Update order if it already exists.
  await db.create(DIRECTORY, order.id, order);
};

module.exports = service;
