import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { redisClient } from "../config/redis-client.js"
import { logger } from "../utils/logger.js"

dotenv.config()
export const isAuthenticatedUser = async (req, res, next)=> {
    try{
        const {userId} = req.query
        if(!userId){
            logger.warn("userId in query is not present")
            return res.status(400).json({
                success: false,
                message:"userId in query is not present"
            })
        } 
        const jwtToken = await redisClient.get(`${process.env.AUTHACCESSTOKENREDIS}:${userId}`)
        if(!jwtToken){
            logger.warn("jwt token is not present Or User logOut")
            return res.status(401).json({
                success: false,
                message:"jwt token is not present Or User logOut"
            })
        }
        const tokenData = jwt.verify(jwtToken, process.env.JWT_SECRET)
        req.session.user = tokenData
        next()
    } catch(error){
        res.status(500).json({
            success: false,
            message: "server fail during isAuthenticatedUser middleware"
        })
    }


}