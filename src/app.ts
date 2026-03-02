import express, { type Request, type Response } from "express";
import { initializeAPI } from "./routes/api";
import { initializeAuthAPI } from "./auth.ts";
import { initializeMessageBroker } from "./message-broker";
import cors from "cors"
import { initializeCache } from "./microservices/cache.ts";

initializeCache();

const SERVER_ROLE = process.env.SERVER_ROLE || "all"
const allowedServerRoles = ["api", "worker", "all"]
if (!allowedServerRoles.includes(SERVER_ROLE)) {
  console.error(`Invalid SERVER_ROLE: ${SERVER_ROLE}`)
  process.exit(1)
}

initializeMessageBroker();

if (SERVER_ROLE === "all" || SERVER_ROLE === "api") {
  const port = 3000
  const app = express()
  
  app.use(cors({
    origin: ['http://localhost:4000', 'http://localhost:3000', 'http://127.0.0.1:4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  app.use(express.json());

  initializeAuthAPI(app); 
  initializeAPI(app);

  app.listen(port, () => {
    console.log(`Microblog listening on port ${port}`)
  })
}