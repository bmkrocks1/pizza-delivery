/*
 * Email Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/17/19
 */

const mailgun = require('../lib/mailgun');
const log = require('../lib/logger')('Email Service');

const service = {};

/**
 * Sends an Invoice email.
 * 
 * @param {any} order Order data.
 * @param {any} owner User data.
 */
service.sendInvoice = (order, owner) => {
  try {
    const data = {
      from: 'Billie <mailgun@sandbox9ff7d71bc1f840fa86ab9dc926da375d.mailgun.org>',
      to: order.userEmail,
      subject: `Pizza Delivery: Order [${order.id}] Receipt`,
      html: `<p>${owner.name}, we've received your order, and the delivery process has begun.</p>
<p>Order Details:</p>
<p>Total Items: ${order.totalQuantity}</p>
<p>Total Amount: $${order.totalAmount}</p>
      `
    };

    mailgun.sendEmail(data);
    log.info(`sendInvoice: Email sent to ${data.to}.`);
  } catch (err) {
    log.error('sendInvoice: Email sending failed!', err);
  }
};

module.exports = service;
