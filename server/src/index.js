import express from "express";
import dotenv from 'dotenv';
import { connectDB } from './db/prisma.js';
import Routes from "./routes/index.route.js";
import cors from 'cors';
import configViewEngine from "./configs/view.config.js";

dotenv.config();

const app = express();
const port = process.env.APP_PORT;

// Gọi cấu hình View Engine
configViewEngine(app);

app.use(cors({
  origin: 'http://localhost:5173', // Cho phép React của bạn
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Quan trọng để gửi token/cookie sau này
}));
// server nhận dữ liệu là json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

Routes(app);

app.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}`)
})

