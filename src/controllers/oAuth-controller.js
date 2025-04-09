import axios from "axios";
import { logger } from "../utils/logger.js";
import { UserRegisteredEmailsData } from "../models/UserRegisteredEmailsData.js";
import { redisClient } from "../config/redis-client.js";
import dotenv from "dotenv";
import { decryptToken, encryptToken } from "../utils/cryptoFunctions.js";
// import { play } from "./playground.js";
dotenv.config({
  path: "./.env",
});

async function getUserInfo(accessToken) {
  try {
    const { data } = await axios.get(process.env.USER_INFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (error) {
    logger.error("Error fetching user info:", error.response.data);
    res.status(500).json({
      message: "Error fetching user info",
      success: false,
    });
  }
}

async function getTokens(code) {
  try {
    const tokenResponse = await axios.post(process.env.TOKEN_ENDPOINT, null, {
      params: {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URL,
        grant_type: "authorization_code",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const {
      access_token,
      expires_in,
      refresh_token,
      scope,
      token_type,
      id_token,
    } = tokenResponse.data;
    return {
      access_token,
      expires_at: Date.now() + expires_in * 1000,
      refresh_token,
      scope,
      token_type,
      id_token,
    };
  } catch (error) {
    logger.error("Error exchanging code for tokens:", error.response.data);
    res.status(500).json({
      message: "Failed to exchange code for oauth tokens",
      success: false,
    });
  }
}

async function refreshAccessToken(refreshToken) {
  try {
    const isRefreshTokenValid = await UserRegisteredEmailsData.findOne(
      {
        "registeredEmailsData.emailRefreshToken": refreshToken,
      },
      {
        registeredEmailsData: {
          $elemMatch: { emailRefreshToken: refreshToken }, //The projection elemMatch tells MongoDB to return only the first matching element from the registeredEmailsData array — not the entire array.
        },
      }
    );
    if (!isRefreshTokenValid) {
      logger.warn("Invalid email refresh token");
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    console.log("isRefreshTokenValid", { isRefreshTokenValid });
    const decryptedRefreshToken = decryptToken(refreshToken);
    const { data } = await axios.post(
      process.env.TOKEN_ENDPOINT,
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: decryptedRefreshToken,
        grant_type: "refresh_token",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = data;

    await redisClient.set(
      `${process.env.AUTHEMAILACCESSTOKENREDIS}:${req.session.user.userId}:${isRefreshTokenValid.registeredEmailsData[0].email}`,
      access_token,
      "EX",
      3599
    );
    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    logger.error("Error during Oauth refresh token:", error.response.data);
    res.status(500).json({
      message: "Error during Oauth refresh token",
      success: false,
    });
  }
}

export function getGoogleOAuthUrl() {
    const options = {
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      response_type: "code",
      scope: [
        // 'https://www.googleapis.com/auth/gmail.send',
        // 'https://www.googleapis.com/auth/gmail.insert',
        // 'https://www.googleapis.com/auth/gmail.modify',
        // 'https://www.googleapis.com/auth/gmail.labels',
        // 'https://www.googleapis.com/auth/gmail.compose',
        // 'https://www.googleapis.com/auth/gmail.metadata',
        // 'https://www.googleapis.com/auth/gmail.settings.basic',
        // 'https://www.googleapis.com/auth/gmail.readonly',
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" "),
      access_type: "offline", // Required to get refresh token
      prompt: "consent",
    };
    const queryString = new URLSearchParams(options).toString();
    return `${process.env.OAUTH_ROOT_URL}?${queryString}`;
  }

export const finalizeOAuth = async (req, res) => {
  logger.info("Finalize OAuth end point hit...");
  try {
    const { code } = req.query;
    if (!code) {
      logger.warn("Authorization code not provided");
      return res.status(400).json({
        success: false,
        message: "Authorization code not provided",
      });
    }
    const tokens = await getTokens(code);
    if (!tokens) {
      logger.warn("Failed to get tokens");
      return res.status(500).json({
        success: false,
        message: "Failed to get tokens",
      });
    }
    console.log("user h yha", req.session.user);
    console.log("Tokens", { tokens });
    // play(tokens.access_token)
    const { access_token, refresh_token } = tokens;
    const userId = req.session.user.userId;
    if (!userId) {
      logger.warn("User ID not found in session");
      return res.status(401).json({
        success: false,
        message: "User ID not found in session",
      });
    }
    const userInfo = await getUserInfo(access_token);
    if (!userInfo) {
      logger.warn("Failed to get user info in email module");
      return res.status(500).json({
        success: false,
        message: "Failed to get user info in email module",
      });
    }
    const { sub, name, email, picture } = userInfo;
    console.log("User Info", { userInfo });

    const existingRegisteredEmail = await UserRegisteredEmailsData.findOne(
      {
        "registeredEmailsData.email": email,
      },
      {
        registeredEmailsData: {
          $elemMatch: { email: email },
        },
      }
    );
    if (existingRegisteredEmail) {
      logger.warn("Email already registered");
      await refreshAccessToken(
        existingRegisteredEmail.registeredEmailsData[0].emailRefreshToken
      );
      return res.status(200).json({
        success: true,
        message: "Email already registered",
        user: userId,
        registeredEmails: email,
      });
    }

    const encryptedEmailRefreshToken = encryptToken(refresh_token);
    console.log("Encrypted refresh token", { encryptedEmailRefreshToken });
    const existing = await UserRegisteredEmailsData.findOne({ user: userId });

    if (existing) {
      await UserRegisteredEmailsData.updateOne(
        { user: userId },
        {
          $push: {
            registeredEmailsData: {
              email,
              emailRefreshToken: encryptedEmailRefreshToken,
              name,
              picture,
              sub,
            },
          },
        }
      );
    } else {
      const newUserRegisteredEmails = new UserRegisteredEmailsData({
        user: userId,
        registeredEmails: [
          {
            email,
            emailRefreshToken: encryptedEmailRefreshToken,
            name,
            picture,
            sub,
          },
        ],
      });
      await newUserRegisteredEmails.save();
    }

    await redisClient.set(
      `${process.env.AUTHEMAILACCESSTOKENREDIS}:${userId}:${email}`,
      access_token,
      "EX",
      3599
    );

    res.status(200).json({
      success: true,
      message: "Email OAuth flow completed successfully",
      user: userId,
      registeredEmails: email,
    });
  } catch (error) {
    logger.error("Error finalizing OAuth", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export async function refreshAccessTokenHandler(req, res) {
  logger.info("Refresh access token endpoint hit...");
  try {
    const email = req.query.email;
    if (!email) {
      logger.warn("Email not provided in query parameters");
      return res.status(400).json({
        success: false,
        message: "Email not provided in query parameters",
      });
    }
    const userId = req.session.user.userId;
    if (!userId) {
      logger.warn("Refresh token user id not provided");
      return res.status(400).json({
        success: false,
        message: "Refresh token user id not provided",
      });
    }
    const existingUser = await UserRegisteredEmailsData.findOne({
      user: userId,
    });
    if (!existingUser) {
      logger.warn("User not found in database");
      return res.status(404).json({
        success: false,
        message: "User not found in database",
      });
    }

    const existingEmail = existingUser.registeredEmailsData.find(
      (emailData) => emailData.email === email
    );
    if (!existingEmail) {
      logger.warn("Email not found in registered emails data");
      return res.status(404).json({
        success: false,
        message: "Email not found in registered emails data",
      });
    }
    const encryptedRefreshToken = existingEmail.emailRefreshToken;

    await refreshAccessToken(encryptedRefreshToken);
    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    logger.error("Error refreshing access token", error.response.data);
    res.status(500).json({
      message: "Error refreshing access token",
      success: false,
    });
  }
}
