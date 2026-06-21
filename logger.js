class Logger {
  log(message) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  }

  error(message) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
  }
}

module.exports = Logger;
