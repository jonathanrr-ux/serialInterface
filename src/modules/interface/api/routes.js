import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota logs
router.get('/logs', controller.getLogs);

// Rota home
router.delete('/logs', controller.deleteLogs);

export default router;