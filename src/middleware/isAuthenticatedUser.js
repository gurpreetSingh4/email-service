import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis-client.js";
import { logger } from "../utils/logger.js";

dotenv.config();

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    const { userId, regemail } = req.query;

    if (!userId) {
      logger.warn("Missing 'userId' in query params");
      return res.status(400).json({
        success: false,
        message: "Missing 'userId' in query parameters",
      });
    }

    const redisKey = `${process.env.AUTHACCESSTOKENREDIS}:${userId}`;
    const jwtToken = await redisClient.get(redisKey);

    if (!jwtToken) {
      logger.warn(`Token not found in Redis for key: ${redisKey}`);
      return res.status(401).json({
        success: false,
        message: "Authentication token not found",
      });
    }

    let tokenData;
    try {
      tokenData = jwt.verify(jwtToken, process.env.JWT_SECRET);
    } catch (err) {
      logger.error(`JWT verification failed: ${err.message}`);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }

    req.session.user = tokenData

    if(regemail) req.session.regEmail = regemail

    next();
  } catch (error) {
    logger.error(`Middleware error in isAuthenticatedUser: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
