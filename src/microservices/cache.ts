import { desc, eq } from 'drizzle-orm'
import { db } from '../db/database'
import { postsTable, usersTable } from '../db/schema'
import IORedis from 'ioredis'
import type { text } from 'drizzle-orm/gel-core'


const CACHE_ACTIVE = (process.env.CACHE_ACTIVE || 'true') === 'true'

let redis: IORedis
// initialize Redis cache client
export const initializeCache = async () => {
  if (redis || !CACHE_ACTIVE) {
    return
  }

  redis = new IORedis({
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }) // Test Redis connection
try {    await redis.ping()
    console.log('Connected to Redis cache')
  } catch (error) {
    console.error('Failed to connect to Redis cache:', error)
    process.exit(1)
      }
    }


type Posts = Awaited<ReturnType<typeof getPostsFromDB>>

export const getPosts = async (userId?: number) => {
  if (!CACHE_ACTIVE) {
    console.log('Cache is disabled, fetching posts from database')
    return await getPostsFromDB() // If cache is disabled, fetch posts directly from the database
  }
  const cachedData =await getPostsFromCache();
  if (cachedData) {
    console.log('Posts retrieved from cache'); // If found in cache, return it
    return JSON.parse(cachedData) as Posts;
  }
  console.log('Posts not found in cache, fetching from database...') // If not found in cache, fetch from database
  const freshPostsFromDB = await getPostsFromDB();
  await setPostsInCache(freshPostsFromDB) // Cache the fresh data from database
  return freshPostsFromDB;
}


const getPostsFromCache = async () => {
  const posts = await redis.get('posts') // Try to get all posts from cache
  if (!redis) {
    console.log('Redis client not initialized, cannot get posts from cache')
    return null; // If Redis client is not initialized, return null
  }
  return await redis.get('posts'); // Return cached posts, can be null if not found
}

const getPostsFromDB = async () => {
  return await db.select({
    id: postsTable.id,
    content: postsTable.content,
    userId: postsTable.userId,
    authorName: usersTable.username,
    sentiment: postsTable.sentiment,
    correction: postsTable.correction,
  })
  .from(postsTable)
  .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
  .orderBy(desc(postsTable.id))

  // TODO: Implement cache logic get posts from database
}

const setPostsInCache = async (posts: Posts) => {
  if (!redis) return // If Redis client is not initialized, do not attempt to set cache
  await redis.set('posts', JSON.stringify(posts), 'EX', 30) // Cache the posts data as a JSON string with expiration time of 30 seconds
  console.log('Posts cached in Redis')
  return posts;
}

export const invalidatePostsCache = async () => {
  if (!CACHE_ACTIVE || !redis) return;
  await redis.del('posts');
  console.log('Cache invalidated') // Invalidate the posts cache by deleting the cached data for all posts
    }
  // TODO: Implement cache logic invalidate posts cache
  // TIP: await redis.del('posts') 
