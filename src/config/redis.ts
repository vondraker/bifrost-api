import Redis from 'ioredis';

// Connect to Redis running on localhost (mapped from docker)
const redis = new Redis({
    host: 'localhost', // Since backend is running locally, we connect to localhost
    port: 6379,
});

redis.on('connect', () => {
    console.log('Redis connected');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redis;
