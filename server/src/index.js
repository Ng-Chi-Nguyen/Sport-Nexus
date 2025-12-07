import express from "express";
import dotenv from 'dotenv';
import { connectDB } from './db/prisma.js';
import Routes from "./routes/index.route.js";

dotenv.config();

const app = express();
const port = process.env.APP_PORT;

connectDB();

Routes(app);

app.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}`)
})

