import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from 'dotenv';
import { connectDB } from './db/prisma.js';
import Routes from "./routes/index.route.js";
import cors from 'cors';
import configViewEngine from "./configs/view.config.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use('/Sport-Nexus', express.static(clientDist));
  app.get('/{*path}', (req, res) => {
    if (req.path.startsWith('/api/')) return;
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log(`[Demo] Frontend tĩnh được serve từ: ${clientDist}`);
}

const server = http.createServer(app);

async function start() {
  await connectDB();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server đang chạy tại: http://localhost:${port}`);
    console.log(`[Demo] Truy cập từ thiết bị khác qua WiFi: http://<IP-máy-này>:${port}`);
  });
}

start().catch(err => {
  console.error('[FATAL] Server startup failed:', err);
  process.exit(1);
});

