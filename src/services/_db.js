/*
 * Internal DB Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/9/19
 */

const path = require('path');
const fs2 = require('../lib/fs2');
const helpers = require('../lib/helpers');
const log = require('../lib/logger')('Internal DB Service');

const db = {};

/**
 * Base directory of the data folder.
 */
const DATA_BASE_DIR = path.join(__dirname, '/../../.data/');

const getDataDir = dir => `${DATA_BASE_DIR}${dir}/`;

const getDataFileName = (dir, file) => `${DATA_BASE_DIR}${dir}/${file}.json`;

db.create = async (dir, file, data) => {
  try {
    const filename = getDataFileName(dir, file);
    const fd = await fs2.open(filename, 'wx');
    await fs2.writeFile(fd, JSON.stringify(data));
    await fs2.close(fd);
  } catch (err) {
    log.error('create:', err);
    throw err;
  }
};

db.read = async (dir, file) => {
  try {
    const filename = getDataFileName(dir, file);
    const data = await fs2.readFile(filename, { encoding: 'utf8' });
    return helpers.parse(data);
  } catch (err) {
    log.error('read:', err);
    throw err;
  }
};

db.list = async dir => {
  try {
    const files = await fs2.readdir(getDataDir(dir));
    return files.map(filename => filename.replace('.json', ''));
  } catch (err) {
    log.error('list:', err);
    throw err;
  }
};

db.listAsObjects = async dir => {
  try {
    const filenames = await db.list(dir);
    const users = [];
    
    for (let i = 0; i < filenames.length; i++) {
      const user = await db.read(dir, filenames[i]);
      users.push(user);
    }

    return users;
  } catch (err) {
    log.error('listAsObjects:', err);
    throw err;
  }
};

db.update = async (dir, file, data) => {
  try {
    const filename = getDataFileName(dir, file);
    const fd = await fs2.open(filename, 'r+');
    await fs2.truncate(filename);
    await fs2.writeFile(fd, JSON.stringify(data));
    await fs2.close(fd);
  } catch (err) {
    log.error('update:', err);
    throw err;
  }
};

db.delete = async (dir, file) => {
  try {
    const filename = getDataFileName(dir, file);
    await fs2.unlink(filename);
  } catch (err) {
    log.error('delete:', err);
    throw err;
  }
};

module.exports = db;
