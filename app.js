import express from 'express';
import path from 'path';
import webRouter from './src/routes/web/routes.js';
import apiRouter from './src/routes/api/routes.js';
import { initSerial } from './src/serial/index.js';

const app = express();

// Inicializa comunicação serial
initSerial();

// Permite receber JSON
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.join(process.cwd(), 'src/views')));

// Rotas WEB
app.use(webRouter);

// Rotas API
app.use(apiRouter);

export default app;