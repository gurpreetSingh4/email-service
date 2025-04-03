import express from "express";
import { finalizeOAuth, getGoogleOAuthUrl } from "../controllers/oAuth-controller.js";
import { isAuthenticatedUser } from "../middleware/isAuthenticatedUser.js";


export const router = express.Router()

// router.post("/messages", registerUser)
// router.post("/threads", loginUser)
// router.post("/drafts", logoutUser)
// router.post("/labels", refreshTokenUser)

router.get("/google", isAuthenticatedUser, (req, res)=> {
    res.redirect(getGoogleOAuthUrl())
})
router.get("/google/callback", finalizeOAuth)

// refresh token pending    try using crone as per production standards