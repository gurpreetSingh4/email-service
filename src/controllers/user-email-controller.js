import dotenv from "dotenv";
import { UserRegisteredEmailsData } from "../models/UserRegisteredEmailsData.js";

dotenv.config();

export const userInfo = async (req) => {
  try {
    const userId = req.session.user.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing in req parameter",
      });
    }

    const currentRegEmail = req.session.regEmail;

    if (!currentRegEmail) {
      return res.status(400).json({
        success: false,
        message: "reg email is missing in req parameter",
      });
    }

    const existingRegisteredEmail = await UserRegisteredEmailsData.findOne(
      {
        "registeredEmailsData.email": currentRegEmail,
      },
      {
        registeredEmailsData: {
          $elemMatch: { email: currentRegEmail },
        },
      }
    );
    if (existingRegisteredEmail) {
      const currentUserPic =
        existingRegisteredEmail.registeredEmailsData[0].picture;
      const currentUserName =
        existingRegisteredEmail.registeredEmailsData[0].name;

      const currentUserEmail =
        existingRegisteredEmail.registeredEmailsData[0].email;
      return {
        id: userId,
        email: currentUserEmail,
        name: currentUserName,
        avatar: currentUserPic,
      };
    }
  } catch (err) {
    console.error("Error fetching user info:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const usersDataInfo = async (req) => {
  try {
    const userId = req.session.user.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user id not found in req query parameter",
      });
    }
    const user = await UserRegisteredEmailsData.findOne({ user: userId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found in data base",
      });
    }

    if (!user?.registeredEmailsData) {
      return [];
    }

    const userData = user.registeredEmailsData.map((entry) => ({
      name: entry.name,
      email: entry.email,
      avatar: entry.picture,
      id: userId,
    }));

    return userData;
  } catch (e) {
    console.log("Error during users getting", e);
  }
};
