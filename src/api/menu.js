/*
 * Menu Route
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/10/19
 */

const authService = require('../services/auth');
const menuService = require('../services/menu');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Menu Route');

const getMenu = async function(success, error) {
  try {
    const menu = await menuService.createMenu();

    log.info(`getMenu: Got menu with ${menu.items.length} items.`);
    success(menu);
  } catch (err) {
    log.error('getMenu:', err);
    error(err);
  }
};

module.exports = {
  GET: authService.withAuthentication(
    helpers.promisifyHandler(getMenu)
  )
};
