import Redis from 'ioredis'

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message)
})

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...')
})

export default redisClient
