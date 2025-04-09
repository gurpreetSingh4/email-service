import express from "express";
import {
  finalizeOAuth,
  getGoogleOAuthUrl,
  refreshAccessTokenHandler,
} from "../controllers/oAuth-controller.js";
import { isAuthenticatedUser } from "../middleware/isAuthenticatedUser.js";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import { connectToApolloServer } from "../graphql/graphql.js";

const gqlServer = connectToApolloServer();
await gqlServer.start();

export const router = express.Router();

// router.post("/messages", registerUser)
// router.post("/threads", loginUser)
// router.post("/drafts", logoutUser)
// router.post("/labels", refreshTokenUser)

router.get("/google",isAuthenticatedUser, (req, res) => {
  res.redirect(getGoogleOAuthUrl());
});
router.get("/google/callback", finalizeOAuth);
router.get("/refreshaccesstoken", refreshAccessTokenHandler);

router.use(
  "/graphql",
  bodyParser.json(),
  expressMiddleware(gqlServer, {
    context: async ({ req, res }) => ({
      req,
      res,
      user: req.session.user, // or however you're handling auth/session
    }),
  })
);
