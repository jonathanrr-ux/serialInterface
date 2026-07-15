import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por salvar as regras
router.post('/', controller.postRule);

// Rota responsável por obter as regras
router.get('/', controller.getRules);

// Rota responsável por deletar todas regras
router.delete('/', controller.deleteRules);

// Rota responsável por deletar uma regra
router.delete('/:id', controller.deleteRule);

export default router;