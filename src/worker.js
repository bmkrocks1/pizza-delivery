/*
 * Worker
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/11/19
 */
const fs = require('fs');
const path = require('path');
const fs2 = require('./lib/fs2');
const helpers = require('./lib/helpers');
const log = require('./lib/logger')('Worker');

const BASE_DATA_DIR = path.join(__dirname, '/../.data/');
const DATA_DIRECTORY_NAMES = ['carts', 'menu-items', 'orders', 'tokens', 'users'];

const MENU_ITEMS_DATA_DIR = path.join(__dirname, '/../.data/menu-items/');
const MENU_ITEMS_CSV_FILE_PATH = path.join(__dirname, '/../menu-items.csv');

const worker = {};

/**
 * Creates all the necessary directories for storing the data.
 */
const createDataDirectories = () => {
  try {
    if (!fs.existsSync(BASE_DATA_DIR)) {
      fs.mkdirSync(BASE_DATA_DIR);
      log.info('createDataDirectories: Base data directory .data/ created.');
    }

    for (let i = 0; i < DATA_DIRECTORY_NAMES.length; i++) {
      const dir = path.join(BASE_DATA_DIR, DATA_DIRECTORY_NAMES[i]);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        log.info(`createDataDirectories: Directory .data/${DATA_DIRECTORY_NAMES[i]} created.`);
      }
    }
  } catch (err) {
    log.error('createDataDirectories:', err);
  }
};

/**
 * Read menu-items.csv and write each item as a JSON file in .data/menu-items/
 */
const loadMenuItemsData = async () => {
  try {
    const data = await fs2.readFile(MENU_ITEMS_CSV_FILE_PATH, 'utf8');

    if (!data) {
      log.error('loadMenuItemsData: No data.');
      return;
    }

    // remove existing files in .data/menu-items directory
    const filenames = fs.readdirSync(MENU_ITEMS_DATA_DIR);
    if (filenames.length > 0) {
      for (let i = 0; i < filenames.length; i++) {
        fs.unlinkSync(path.join(MENU_ITEMS_DATA_DIR, filenames[i]));
      }
      log.info(`loadMenuItemsData: Deleted ${filenames.length} menu items.`);
    }

    const items = data.split(/\r?\n/);

    // get the column headers
    let [idKey, nameKey, descriptionKey, priceKey] = items[0]
      .split(',')
      .map(key => key.toLowerCase());

    idKey = 'id';

    // for each row, create a menu item data and write it into a JSON file
    for (let i = 1; i < items.length; i++) {
      let [id, name, description, price] = items[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      name = helpers.unquote(name);
      description = helpers.unquote(description);
      price = helpers.parseFloat(price);

      let itemData = {
        [idKey]: id,
        [nameKey]: name,
        [descriptionKey]: description,
        [priceKey]: price
      };

      fs.writeFileSync(
        path.join(MENU_ITEMS_DATA_DIR, `${id}.json`), 
        JSON.stringify(itemData)
      );
    }

    log.info(`loadMenuItemsData: Loaded ${items.length - 1} menu items.`);
  } catch (err) {
    log.error('loadMenuItemsData:', err);
  }
};

worker.init = async () => {
  createDataDirectories();
  await loadMenuItemsData();
};

module.exports = worker;
