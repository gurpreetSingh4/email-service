import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { logger } from "./utils/logger.js";
import { connectToMongoDb } from "./database/mongoDb.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { router } from "./routes/email-routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { redisClient } from "./config/redis-client.js";
import { emailTypeDefs } from "./graphql/graphqlTypeDefs/email-typeDefs.js";
import { graphQlEmailResolvers } from "./graphql/graphqlResolvers/email-resolvers.js";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import { isAuthenticatedUser } from "./middleware/isAuthenticatedUser.js";

dotenv.config({
  path: "./.env",
});

const app = express();
const port = process.env.PORT || 3006;

await connectToMongoDb(process.env.MONGODB_URI);

const gqlServer = new ApolloServer({
  typeDefs: emailTypeDefs,
  resolvers: graphQlEmailResolvers,
});
await gqlServer.start();

// middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api/email/graphql")) {
    return next(); // skip JSON parser
  }
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api/email/graphql")) {
    return next();
  }
  helmet()(req, res, next);
});

app.use(
  cors({
    origin: `${process.env.VITE_FRONTEND_URL}`, // your Vite frontend origin
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   rateLimiter
//     .consume(req.ip)
//     .then(() => {
//       next();
//     })
//     .catch(() => {
//       logger.warn(`Too many requests from IP: ${req.ip}`);
//       res.status(429).json({
//         success: false,
//         message: "Too many requests",
//       });
//     });
// });

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to `true` if using HTTPS
      httpOnly: true,
      sameSite: "lax", // Prevents client-side JS access
      maxAge: 86400000, // 1-day expiration
    },
  })
);

// Middleware to store user object in session
// Inorder to handle unexpected undefined error
app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = {}; // Initialize if not present
    req.session.regEmail = {}; // Initialize if not present
  }
  next();
});

app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

// GraphQL route
app.use(
  "/api/email/graphql",
  isAuthenticatedUser,
  bodyParser.json(),
  expressMiddleware(gqlServer, {
    context: async ({ req, res }) => ({
      req,
      res,
      user: req.session?.user ?? null, // or however you're handling auth/session
      regEmail: req.session?.regEmail ?? null,
    }),
  })
);


// routes
app.use("/api/email", router);

// error handler
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Apollo Server is running on port ${port}`);
});

//unhandled promise rejection -> Promise is rejected but not caught
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
