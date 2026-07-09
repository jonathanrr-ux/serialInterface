import express from 'express';
import path from 'path';
import router from './src/modules/index.js';
import setupMiddleware from './src/modules/shared/middleware/index.js';
import errorHandler from './src/modules/shared/middleware/error.js';
// import { initSerial } from './src/serial/index.js';

const app = express();

// Permite receber JSON
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Aplica os middlewares
setupMiddleware(app);

// Rotas
app.use(router);

// Middleware de erro 
app.use(errorHandler);

export default app;