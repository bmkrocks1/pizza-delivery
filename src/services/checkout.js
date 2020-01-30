/*
 * Checkout Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/17/19
 */

const stripe = require('../lib/stripe');
const ordersService = require('../services/orders');
const emailService = require('../services/email');
const orderValidator = require('../validators/order');
const log = require('../lib/logger')('Checkout Service');

const service = {};

/**
 * Creates a checkout process data and auto-confirms the Payment Intent.
 * The `owner` is required to have his/her Payment Method setup already.
 * 
 * @param {any} cart Cart data.
 * @param {any} owner User data.
 */
service.checkout = async (cart, owner) => {
  try {
    if (!owner.paymentMethod) {
      throw 'The user has no payment method.';
    }

    // Create payment method
    const paymentMethod = await stripe.createPaymentMethod(owner.paymentMethod);

    // Create order
    const cartData = orderValidator.toCreate(cart);
    const order = await ordersService.create(cartData, owner);

    const options = {
      paymentMethodId: paymentMethod.id,
      amount: order.totalAmount,
      currency: 'usd',
      description: `Payment for your order [${order.id}]`
    };

    // Create Payment Intent
    const paymentIntent = await stripe.createPaymentIntent(options);
    log.info('checkout: Payment intent created,', paymentIntent);

    order.status = ordersService.ORDER_STATUS.TO_DELIVER;
    await ordersService.save(order);
    log.info('checkout: Order saved,', order);

    emailService.sendInvoice(order, owner);

    return order;
  } catch (err) {
    log.error('checkout:', err);
    throw err;
  }
};

module.exports = service;
