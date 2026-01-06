import express from "express";
import dotenv from "dotenv";
import { testConnection } from "./config/database.js";
import "./models/index.js";

import Zone from "./models/Zone.js";
import Driver from "./models/Driver.js";
import Delivery from "./models/Delivery.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LogistMa API is running...");
});
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  await testConnection();
});
