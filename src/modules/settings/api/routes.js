import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por obter a config
router.get('/', controller.getConfig);

// Rota responsável por salvar a config
router.post('/save', controller.postConfig);

export default router;