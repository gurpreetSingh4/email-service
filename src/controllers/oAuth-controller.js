import axios from "axios";
import { logger } from "../utils/logger.js";
import { UserRegisteredEmailsData } from "../models/UserRegisteredEmailsData.js";
import { redisClient } from "../config/redis-client.js";
import dotenv from "dotenv";
import { decryptToken, encryptToken } from "../utils/cryptoFunctions.js";
import { isValidObjectId, Types } from "mongoose";

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

export async function refreshToken(refreshToken) {
  console.log("aaya h refresh token", refreshToken);
  try {
    const { data } = await axios.post(
      process.env.TOKEN_ENDPOINT,
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return data;
  } catch (e) {
    logger.error(e, "error refresh token function");
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
    const userId = req.session.user.userId;
    if (!userId) {
      logger.warn("User ID not found in session");
      return res.status(401).json({
        success: false,
        message: "User ID not found in session",
      });
    }
    const userInfo = await getUserInfo(tokens.access_token);
    if (!userInfo) {
      logger.warn("Failed to get user info in email module");
      return res.status(500).json({
        success: false,
        message: "Failed to get user info in email module",
      });
    }
    const { sub, name, email, picture } = userInfo;

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

    if (
      existingRegisteredEmail &&
      existingRegisteredEmail.registeredEmailsData &&
      existingRegisteredEmail.registeredEmailsData.length > 0 &&
      existingRegisteredEmail.registeredEmailsData[0].emailRefreshToken
    ) {
      logger.info("Email already registered");

      const encrypRefToken =
        existingRegisteredEmail.registeredEmailsData[0].emailRefreshToken;
      const previousRefreshtoken = decryptToken(encrypRefToken);
      const { access_token } = await refreshToken(previousRefreshtoken);

      console.log("you ji ", access_token);
      req.session.regEmail = email;
      await redisClient.set(
        `${process.env.AUTHEMAILACCESSTOKENREDIS}:${userId}:${email}`,
        access_token,
        "EX",
        3599
      );
      return res.redirect(
        `${process.env.VITE_OAUTH_GMAIL_CALLBACK}?success=true&regemail=${email}&userid=${userId}`
      );
      // return res.status(200).json({
      //   success: true,
      //   message: "Email already registered",
      //   user: userId,
      //   registeredEmails: email,
      // });
    }

    const encryptedEmailRefreshToken = encryptToken(tokens.refresh_token);
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
      tokens.access_token,
      "EX",
      3599
    );
    req.session.regEmail = email;
    return res.redirect(
      `${process.env.VITE_OAUTH_GMAIL_CALLBACK}?success=true&regemail=${email}&userid=${userId}`
    );
    // res.status(200).json({
    //   success: true,
    //   message: "Email OAuth flow completed successfully",
    //   user: userId,
    //   registeredEmails: email,
    // });
  } catch (error) {
    logger.error("Error finalizing OAuth", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  const { userid, regemail } = req.query;
  if (!userid || !regemail) {
    return res.status(400).json({
      success: false,
      message: "userid , regemail not found in query parameter",
    });
  }

  const existingRegisteredEmail = await UserRegisteredEmailsData.findOne(
    {
      "registeredEmailsData.email": regemail,
    },
    {
      registeredEmailsData: {
        $elemMatch: { email: regemail },
      },
    }
  );
  if (existingRegisteredEmail) {
    const encrypRefToken =
      existingRegisteredEmail.registeredEmailsData[0].emailRefreshToken;
    const previousRefreshtoken = decryptToken(encrypRefToken);
    const { access_token } = await refreshToken(previousRefreshtoken);
    await redisClient.set(
      `${process.env.AUTHEMAILACCESSTOKENREDIS}:${userid}:${regemail}`,
      access_token,
      "EX",
      3599
    );
    return res.status(200).json({
      success: true,
      message: `Existing Registered ${regemail} Access Token Refresh successfully`,
      user: userid,
      regEmail: regemail,
    });
  }
};

export async function removeRegisteredEmailByUser(req, res) {
  const userId = req.query.userid;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userid not found in query param",
    });
  }
  const email = req.query.regemail;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "userid not found in query param",
    });
  }
  try {
    const result = await UserRegisteredEmailsData.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          registeredEmailsData: { email: email },
        },
      },
      { new: true }
    );

    if (!result) {
      throw new Error("User not found or email not present");
    }

    res.status(200).json({
      success: true,
      message: "Email entry removed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error removing registered email:", error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
}
