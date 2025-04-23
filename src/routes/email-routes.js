import express from "express";
import {
  finalizeOAuth,
  getGoogleOAuthUrl,
  refreshAccessToken,
  removeRegisteredEmailByUser,
} from "../controllers/oAuth-controller.js";
import { isAuthenticatedUser } from "../middleware/isAuthenticatedUser.js";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import { connectToApolloServer } from "../graphql/graphql.js";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware.js";

const gqlServer = connectToApolloServer();
await gqlServer.start();

export const router = express.Router();

// router.post("/messages", registerUser)
// router.post("/threads", loginUser)
// router.post("/drafts", logoutUser)
// router.post("/labels", refreshTokenUser)

router.get("/refreshaccesstoken", userAuthMiddleware, refreshAccessToken)
router.get("/deleteregisteredemail", userAuthMiddleware, removeRegisteredEmailByUser)

router.get("/google",isAuthenticatedUser, (req, res) => {
  res.redirect(getGoogleOAuthUrl());
});
router.get("/google/callback", finalizeOAuth);

router.use(
  "/graphql",
  isAuthenticatedUser,
  bodyParser.json(),
  expressMiddleware(gqlServer, {
    context: async ({ req, res }) => ({
      req,
      res,
      user: req.session.user, // or however you're handling auth/session
      regEmail: req.session.regEmail,
    }),
  })
);
