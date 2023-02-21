'use strict';

const winston = require('winston');

const { Console } = winston.transports;

const logger = winston.createLogger({
  transports: [
    /**
     * Using console.log might be problematic in production environments
     * as it is locking in certain circumstances.
     * An easy way to avoid this, is to log to a file on production. This
     * seems not to be possible within our Docker / Kubernetes setup.
     *
     * TODO fix potential problems in the future here.
     */
    new Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
  ],
});

module.exports = logger;
module.exports.stream = {
  write: function(message) {
    // logger.info relies on 'this'
    logger.info(message);
  },
};
