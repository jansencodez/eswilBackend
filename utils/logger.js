const winston = require("winston");

const logger = winston.createLogger({
  level: "info", // Set the default log level to 'info'
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

module.exports = { logger };
