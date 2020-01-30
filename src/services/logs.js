/* eslint-disable no-unused-vars */
/*
 * Logs Service
 * 
 * Author: Billie Ko <bmkrocks@gmail.com>
 * Date: 12/9/19
 */

const path = require('path');
const zlib = require('zlib');
const fs2 = require('../lib/fs2');
const log = require('../lib/logger')('Logs Service');

const service = {};

/**
 * Base directory of the logs folder.
 */
const LOGS_BASE_DIR = path.join(__dirname, '/../../.logs/');

const getLogFileName = file => `${LOGS_BASE_DIR}${file}.log`;
const getGzipFileName = file => `${LOGS_BASE_DIR}${file}.gz.b64`;

service.appendToFile = async (file, data) => {
  try {
    const filename = getLogFileName(file);
    const fd = await fs2.open(filename, 'a');
    await fs2.appendFile(fd, JSON.stringify(data));
    await fs2.close(fd);
  } catch (err) {
    log.error('appendToFile:', err);
    throw err;
  }
};

module.exports = service;
