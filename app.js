import express from 'express';
import path from 'path';
import router from './src/modules/index.js';
import setupMiddleware from './src/modules/shared/middleware/index.js';
import { initSerial } from './src/serial/index.js';

const app = express();

// Inicializa comunicação serial
initSerial();

// Permite receber JSON
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Aplica os middlewares
setupMiddleware(app);

// Rotas
app.use(router);

export default app;