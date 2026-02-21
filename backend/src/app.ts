import express, { type Request, type Response } from "express";
import { initializeAPI } from "./routes/api";
import authRouter from "./auth";
import { initializeMessageBroker } from "./message-broker";
import cors from "cors"

const SERVER_ROLE = process.env.SERVER_ROLE || "all"
const allowedServerRoles = ["api", "worker", "all"]
if (!allowedServerRoles.includes(SERVER_ROLE)) {
  console.error(`Invalid SERVER_ROLE: ${SERVER_ROLE}`)
  process.exit(1)
}

 /* const app = express();
const port = 3000;


app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

initializeAPI(app);
initializeAuthAPI(app); */

if (SERVER_ROLE === "worker" || SERVER_ROLE === "all") {
  initializeMessageBroker()
}

if (SERVER_ROLE === "all" || SERVER_ROLE === "api") {
  const port = 3000

  const app = express()
  app.use(express.json())
  app.use(cors())

  app.use("/auth", authRouter)

  initializeAPI(app)

  app.listen(port, () => {
    console.log(`Microblog listening on port ${port}`)
  })
}