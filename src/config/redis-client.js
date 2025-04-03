import Redis from "ioredis";
import dotenv from "dotenv"

dotenv.config()
export const redisClient = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
}).on('error', (error) => {
    console.error(error);
})

export async function invalidatePostCache(req, input){
    const cachedKey = `post:${input}`
    await req.redisClient.del(cachedKey)

    const keys = await req.redisClient.keys("posts:*")
    if(keys.length > 0){
        await req.redisClient.del(keys)
    }
}