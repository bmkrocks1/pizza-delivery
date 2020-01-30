/*
 * Mailgun Library
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/17/19
 */
const https = require('https');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const helpers = require('./helpers');
const log = require('./logger')('Mailgun');

const lib = {};

lib.sendEmail = options =>
  new Promise((resolve, reject) => {
    const { from, to, subject, html } = options;
    const body = { from, to, subject, html };
    const data = querystring.stringify(body);

    const reqOptions = {
      hostname: 'api.mailgun.net',
      path: '/v3/sandbox9ff7d71bc1f840fa86ab9dc926da375d.mailgun.org/messages',
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:17b0d78bc4ecc12208013fe91c43b1cc-f8b3d330-ea68383c').toString('base64'),
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
          log.error('sendEmail:', {
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

    log.info('Sending Email...', body);
    req.end();
  });

module.exports = lib;
