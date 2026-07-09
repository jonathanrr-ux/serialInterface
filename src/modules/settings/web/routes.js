import express from 'express';
import * as controller from './controller.js';
import path from 'path';

const router = express.Router();

// Rota settings
router.get('/', controller.getSettings);

export default router;