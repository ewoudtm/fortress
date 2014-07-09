/**
 * Settings for the chat server connection. Mixes
 * @type {{server: string, reconnect: boolean, reconnection delay: number, reconnection limit: number, max reconnection attempts: Number}}
 */
module.exports.chat = {
  'server': 'http://node01.islive.nl:8080',
  socket: {
    'reconnect': true,
    'reconnection delay': 100, // 100ms between retries
    'reconnection limit': 500, // The maximum time between retries.
    'max reconnection attempts': Infinity
  }
};
