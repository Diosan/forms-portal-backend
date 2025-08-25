import RedisStore from "connect-redis"
import session from 'express-session';
import {createClient} from "redis"


// Initialize client.
export let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
export let redisStore = new RedisStore({
  client: redisClient,
  prefix: "swf:",
})





redisClient.on('error', err => {
  console.log('Error connecting to Redis ' + err);
});


const userChannelPrefix = 'user:';
export const userChannel = (userId) => userChannelPrefix + userId;

