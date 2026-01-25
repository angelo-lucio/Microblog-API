import express, { type Request, type Response } from "express";
import { initializeAPI } from "./api";
import { initializeAuthAPI } from "./api/auth";

const app = express();
const port = 3000;


app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

initializeAPI(app);

