import express, { type Request, type Response } from "express";
import { initializeAPI } from "./routes/api";
import { initializeAuthAPI } from "./auth.ts";
import { initializeMessageBroker } from "./message-broker";
import cors from "cors"
import { initializeCache } from "./microservices/cache.ts";
import { limiter } from "./routes/rate-limiter.ts";
import { httpLogger } from "./microservices/logger.ts"
import { logger } from "./microservices/logger.ts" 
import promMid from 'express-prometheus-middleware'


initializeCache();

const SERVER_ROLE = process.env.SERVER_ROLE || "all"
const allowedServerRoles = ["api", "worker", "all"]
if (!allowedServerRoles.includes(SERVER_ROLE)) {
  logger.fatal(`Invalid SERVER_ROLE: ${SERVER_ROLE}`)
  process.exit(1)
}

initializeMessageBroker();

if (SERVER_ROLE === "all" || SERVER_ROLE === "api") {
  const port = 3000
  const app = express()

  app.set('trust proxy', 1);

  app.use(cors({
    origin: ['http://localhost:4000', 'http://localhost:3000', 'http://127.0.0.1:4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  app.use(limiter);
  app.use(express.json());

  app.use(httpLogger);


  app.use(
    promMid({
      metricsPath: '/metrics',
      collectDefaultMetrics: false,
      requestDurationBuckets: [0.1, 0.5, 1, 1.5],
      requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
      responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    })
  )
  initializeAuthAPI(app); 
  initializeAPI(app);

  app.listen(port, () => {
    logger.info(`Microblog listening on port ${port}`)
  })
}