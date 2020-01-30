/*
 * Server
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/9/19
 */

const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const fs2 = require('./lib/fs2');
const helpers = require('./lib/helpers');
const log = require('./lib/logger')('Server');
const cartRoute = require('./api/cart');
const checkoutRoute = require('./api/checkout');
const loginRoute = require('./api/login');
const logoutRoute = require('./api/logout');
const menuRoute = require('./api/menu');
const ordersRoute = require('./api/orders');
const usersRoute = require('./api/users');

const API_PATH_REGEX = /^api\/(\w+(?:-\w+)*)$/;
const APP_PATH_REGEX = /^(?:(\w+(?:-\w+)*))?$/;

const RouteType = {
  API: 'api',
  APP: 'app',
  ASSET: 'asset'
};

const GLOBAL_DATA = {
  baseUrl: 'http://localhost:3000/',
  appName: 'Pizza Delivery'
};

const getPathAndQuery = requestUrl => {
  const parsedUrl = url.parse(requestUrl, true);
  return {
    path: parsedUrl.pathname.replace(/^\/+|\/+$/g, ''),
    query: parsedUrl.query
  };
};

const getRouteHandler = path => {
  let type;
  let handler;

  if (!path) {
    log.debug('getRouteHandler: APP default path');
    handler = server.appRoute[''];
    type = RouteType.APP;
  }

  if (!handler) {
    let matches = path.match(API_PATH_REGEX);
    log.debug('getRouteHandler: API path matches,', matches);
    if (matches && matches[1]) {
      handler = server.apiRoute[matches[1]];
      type = RouteType.API;
    }
  }

  if (!handler) {
    let matches = path.match(APP_PATH_REGEX);
    log.debug('getRouteHandler: APP path matches,', matches);
    if (matches) {
      handler = server.appRoute[matches[1] || ''];
      type = RouteType.APP;
    }
  }

  if (!handler) {
    // Maybe add checking if path is a filename.
    handler = getStaticAsset;
    type = RouteType.ASSET;
  }

  return { type, handler };
};

const getStaticAsset = async filename => {
  try {
    const assetPath = path.join(__dirname,'/../public/', filename);
    const data = await fs2.readFile(assetPath);
    let contentType = 'plain/text';

    if (filename.endsWith('.icon')) {
      contentType = 'image/x-icon';
    } else if (filename.endsWith('.js')) {
      contentType = 'application/javascript';
    } else if (filename.endsWith('.css')) {
      contentType = 'text/css';
    } else if (filename.endsWith('.html')) {
      contentType = 'text/html';
    }

    return { data, contentType };
  } catch (err) {
    log.error('getStaticAsset:', err);
    return { data: null, contentType: null };
  }  
};

const getTemplate = async templateName => {
  try {
    const assetPath = path.join(__dirname,'/../templates/', templateName);
    const data = await fs2.readFile(assetPath);

    return { data, contentType: 'text/html' };
  } catch (err) {
    log.error('getTemplate:', err);
    return { data: null, contentType: null };
  }
};

const appRoute = templateName => {
  return async () => {
    log.debug('appRoute template:', templateName);

    // Get index.html
    const index = await getStaticAsset('index.html');
    let indexHtml = index.data.toString();

    // Interpolate global data
    Object.keys(GLOBAL_DATA).forEach(key => {
      indexHtml = indexHtml.replace(`{{global.${key}}}`, GLOBAL_DATA[key]);
    });

    // Interpolate head data
    const headData = {
      title: templateName.charAt(0).toUpperCase() + templateName.slice(1),
      description: 'pizza delivery'
    };

    Object.keys(headData).forEach(key => {
      indexHtml = indexHtml.replace(`{{head.${key}}}`, headData[key]);
    });

    // Get the template html
    const template = await getTemplate(`${templateName}.html`);
    const templateHtml = template.data.toString();
    const html = indexHtml.replace('{{html-template-content}}', templateHtml);

    return html;
  };
};

const server = {};

server.apiRoute = {
  'login': loginRoute,
  'logout': logoutRoute,
  'menu': menuRoute,
  'users': usersRoute,
  'cart': cartRoute,
  'checkout': checkoutRoute,
  'orders': ordersRoute
};

server.appRoute = {
  // '': homePageRoute,
  // 'signup': signupPageRoute,
  // 'menu': menuPageRoute,
  // 'cart': cartPageRoute,
  // 'checkout': checkoutPageRoute
  '': appRoute('home'),
  'login': appRoute('login'),
  'signup': appRoute('signup'),
  'menu': appRoute('menu'),
  'cart': appRoute('cart'),
  'checkout': appRoute('checkout')
};

server.listener = (request, response) => {
  const { path, query } = getPathAndQuery(request.url);
  const method = request.method.toUpperCase();
  const headers = request.headers;

  // Get the body, if any
  const decoder = new StringDecoder('utf8');
  let payloadBuffer = '';

  request.on('data', data => {
    log.debug('data:', data);
    payloadBuffer += decoder.write(data);
  });

  request.on('end', async () => {
    payloadBuffer += decoder.end();

    const payload = helpers.parse(payloadBuffer);

    log.line();
    log.debug('Path:', path);
    log.debug('Method:', method);
    log.debug('Request Query Parameters:', query);
    log.debug('Request Payload:', payload);

    // Choose the handler for this request.
    const { type, handler } = getRouteHandler(path);

    if (!handler) {
      log.error(`${path} route not found.`);
      response.writeHead(404);
      response.end(`${path} route not found.`);
    }
    else if ((type === RouteType.API && !handler[method]) || (type !== RouteType.API && method !== 'GET')) {
      log.error(`${method} method not supported.`);
      response.writeHead(405);
      response.end(`${method} method not supported.`);
    }
    else {
      try {
        if (type === RouteType.API) {
          const requestData = {
            headers,
            method,
            query,
            body: payload
          };

          log.debug('Passing request data to API route handler...');

          const { statusCode, data } = await handler[method](requestData);
          response.setHeader('Content-Type', 'application/json');
          response.writeHead(statusCode);
          response.end(JSON.stringify(data));
        } else if (type === RouteType.APP) {
          const requestData = {
            headers,
            query
          };

          log.debug('Passing request data to APP route handler...');

          const data = await handler(requestData);
          response.setHeader('Content-Type', 'text/html');
          response.writeHead(200);
          response.end(data);
        } else if (type === RouteType.ASSET) {
          log.debug('Reading file...');

          const { data, contentType } = await handler(path);
          
          if (!data) {
            log.debug('File not found');
            response.writeHead(404);
            response.end();
          } else {
            response.setHeader('Content-Type', contentType);
            response.writeHead(200);
            response.end(data);
          }
        }
      } catch (err) {
        log.error('Internal Server Error,', err);
        response.writeHead(500);
        response.end('Something went wrong!');
      }
    }
  });
};

server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpServer = http.createServer(server.listener);

server.httpsServer = https.createServer(server.httpsServerOptions, server.listener);

server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, () => {
    log.info(`The HTTP server is listening to port ${config.httpPort} now.`);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
    log.info(`The HTTPS server is listening to port ${config.httpsPort} now.`);
  });
};

module.exports = server;
