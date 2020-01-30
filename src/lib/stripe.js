/*
 * Stripe Library
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/13/19
 */
const https = require('https');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const helpers = require('./helpers');
const log = require('./logger')('Stripe');

const lib = {};

lib.createPaymentMethod = options =>
  new Promise((resolve, reject) => {
    const { type, cardNumber, cardExpMonth, cardExpYear, cardCVC } = options;
    const body = {
      type,
      'card[number]': cardNumber,
      'card[exp_month]': cardExpMonth,
      'card[exp_year]': cardExpYear,
      'card[cvc]': cardCVC
    };
    const data = querystring.stringify(body);

    const reqOptions = {
      hostname: 'api.stripe.com',
      path: '/v1/payment_methods',
      method: 'POST',
      auth: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(reqOptions, response => {
      const decoder = new StringDecoder('utf8');
      let bodyBuffer = '';

      response.on('data', chunk => {
        bodyBuffer += decoder.write(chunk);
      });

      response.on('end', () => {
        bodyBuffer += decoder.end();
        const responseBody = helpers.parse(bodyBuffer);

        if (response.statusCode >= 400) {
          log.error('createPaymentMethod:', {
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: responseBody
          });

          reject({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: responseBody
          });
        } else {
          resolve(responseBody);
        }
      });
    });

    req.write(data);

    log.info('Creating Payment Method...', body);
    req.end();
  });

lib.createPaymentIntent = options => 
  new Promise((resolve, reject) => {
    const { amount, description, currency, paymentMethodId } = options;
    const body = { 
      amount, 
      description, 
      currency,
      'payment_method_types[]': 'card',
      confirm: 'true',
      'payment_method': paymentMethodId
    };

    const data = querystring.stringify(body);

    const reqOptions = {
      hostname: 'api.stripe.com',
      path: '/v1/payment_intents',
      method: 'POST',
      auth: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(reqOptions, response => {
      const decoder = new StringDecoder('utf8');
      let bodyBuffer = '';

      response.on('data', chunk => {
        bodyBuffer += decoder.write(chunk);
      });

      response.on('end', () => {
        bodyBuffer += decoder.end();
        const responseBody = helpers.parse(bodyBuffer);

        if (response.statusCode >= 400) {
          log.error('createPaymentIntent:', {
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: responseBody
          });

          reject({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            body: responseBody
          });
        } else {
          resolve(responseBody);
        }
      });
    });

    req.write(data);

    log.info('Creating Payment Intent...', body);
    req.end();
  });

module.exports = lib;
