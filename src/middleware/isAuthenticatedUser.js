import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis-client.js";
import { logger } from "../utils/logger.js";

dotenv.config();

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    const { userid, regemail } = req.query;

    console.log("is user authenticate me ", userid, regemail);

    if (!userid) {
      logger.warn("Missing 'userid' in query params");
      return res.status(400).json({
        success: false,
        message: "Missing 'userid' in query parameters",
      });
    }
    if (!regemail) {
      regemail = await redisClient.get(`${process.env.CURRENTEMAILTOKENREDIS}`);
    }

    const redisKey = `${process.env.AUTHACCESSTOKENREDIS}:${userid}`;
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

    req.session.user = tokenData;

    if (regemail) {
      req.session.regEmail = regemail;
      console.log(regemail);
      next();
    }
    req.session.regEmail = await redisClient.get(
      `${process.env.CURRENTEMAILTOKENREDIS}`
    );
    req.session.regName = await redisClient.get(
      `${process.env.CURRENTNAMETOKENREDIS}`
    );

    next();
  } catch (error) {
    logger.error(`Middleware error in isAuthenticatedUser: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
