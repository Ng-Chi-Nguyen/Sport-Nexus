import express from "express";
import dotenv from 'dotenv';
import { connectDB } from './db/prisma.js';

dotenv.config();

const app = express()
const port = process.env.APP_PORT

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}`)
})

