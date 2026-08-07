const { createClient } = require("redis"); // ✅ use require instead of import

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket:  {
    host: 'redis-18083.c274.us-east-1-3.ec2.cloud.redislabs.com',
    port: 18083
}
});

// client.on('error', err => console.log('Redis Client Error', err));

// await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

module.exports = redisClient;


// const client = createClient({
//     username: 'default',
//     password: 'hxht0zqFbXburWHiSqEFWgIgPpKGjHlb',
//     socket: {
//         host: 'redis-16859.crce182.ap-south-1-1.ec2.cloud.redislabs.com',
//         port: 16859
//     }
// });

// client.on('error', err => console.log('Redis Client Error', err));

// await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

