import express from "express";
import { initializeAPI } from "./routes/api";
import cors from 'cors'

const port = 3000;
const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }))

initializeAPI(app);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});