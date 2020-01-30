/*
 * Menu Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/10/19
 */

const db = require('./_db');
const log = require('../lib/logger')('Menu Service');

const DIRECTORY = 'menu-items';

const service = {};

/**
 * Creates and returns the menu.
 */
service.createMenu = async () => {
  try {
    const menuItems = await db.listAsObjects(DIRECTORY);
    return { items: menuItems };
  } catch (err) {
    log.error('createMenu:', err);
    throw 'Could not create the menu.';
  }
};

/**
 * Retrieves a menu item with the specified ID.
 * 
 * @param {string} id Menu item ID.
 */
service.getItem = async id => {
  try {
    return await db.read(DIRECTORY, id);
  } catch (err) {
    log.error('getItem:', err);
    throw 'Could not get the item.';
  }
};

module.exports = service;
