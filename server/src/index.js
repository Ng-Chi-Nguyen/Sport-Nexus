import express from "express";
import http from "http";
import dotenv from 'dotenv';
import { connectDB } from './db/prisma.js';
import Routes from "./routes/index.route.js";
import cors from 'cors';
import configViewEngine from "./configs/view.config.js";

dotenv.config();

const app = express();
const port = process.env.APP_PORT || 8080;

configViewEngine(app);

app.use(cors({
  origin: ['http://localhost:5173', 'https://ng-chi-nguyen.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

Routes(app);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0', email_updated: true });
});

const server = http.createServer(app);

async function start() {
  await connectDB();
  server.listen(port, () => {
    console.log(`Server đang chạy tại: http://localhost:${port}`)
  });
}

start().catch(err => {
  console.error('[FATAL] Server startup failed:', err);
  process.exit(1);
});

