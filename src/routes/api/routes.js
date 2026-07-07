import express from 'express';
import * as controller from './controller.js';
import path from 'path';

const router = express.Router();

// Rota para buscar a conexão
router.get('/api/serial', controller.getSerial);

export default router;