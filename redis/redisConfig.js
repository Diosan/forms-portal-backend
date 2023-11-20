const redis = require('redis');
const redisAdapter = require('socket.io-redis');
const emitter = require('socket.io-emitter')({ host: 'localhost', port: 6379 });
const url = 'redis://localhost:6379';

const client = redis.createClient({
  socket: {
    host: 'localhost',
    port: '6379'
  }
});

client.on('error', err => {
  console.log('Error connecting to Redis ' + err);
});

(async () => {
  await client.connect();
})();

const userChannelPrefix = 'user:';
const userChannel = (userId) => userChannelPrefix + userId;

module.exports = {
  redisClient: client,
  userChannel: userChannel,
  redisAdapter: redisAdapter,
  emitter: emitter,
  redisURL:url
};
