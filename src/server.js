import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import {RedisStore} from "connect-redis";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { logger } from "./utils/logger.js";
import { connectToMongoDb } from "./database/mongoDb.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { router } from "./routes/email-routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { redisClient } from "./config/redis-client.js";
import { connectToApolloServer } from "./graphql/graphql.js";


dotenv.config({
  path: "./.env",
});

const app = express();
const port = process.env.PORT || 3006;

const gqlServer = connectToApolloServer();
await gqlServer.start();

await connectToMongoDb(process.env.MONGODB_URI);

// middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use("/graphql", bodyParser.json(), expressMiddleware(gqlServer));


app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      logger.warn(`Too many requests from IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    });
});



app.use(session({
  store: new RedisStore({ client: redisClient}),
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie:{
    secure: false,   // Set to `true` if using HTTPS
    httpOnly: true,  // Prevents client-side JS access
    maxAge: 86400000 // 1-day expiration
  }
}))

// Middleware to store user object in session
// Inorder to handle unexpected undefined error
app.use((req, res, next) => {
  if (!req.session.user) {
      req.session.user = {};  // Initialize if not present
  }
  next();
});

// routes
app.use("/api/email", router);

// Apollo server middleware (if using Apollo Server)



// app.use("/graphql", bodyParser.json(), expressMiddleware(gqlServer));
// app.use("/graphql", bodyParser.json(), expressMiddleware(gqlServer, {
//   context: async ({ req, res }) => ({
//     req,
//     res,
//     user: req.session.user, // or however you're handling auth/session
//   }),
// }));

// error handler
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

//unhandled promise rejection -> Promise is rejected but not caught
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
