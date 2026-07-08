import express from 'express';
import * as controller from './controller.js';
import path from 'path';

const router = express.Router();

// Rota /
router.get('/', controller.getIndex);

export default router;