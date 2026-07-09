import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por salvar a config
router.post('/save', controller.postConfig);

export default router;