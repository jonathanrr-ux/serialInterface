import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por salvar as regras
router.post('/:id/template', controller.postTemplateRule);

// Rota responsável por deletar uma regra
router.delete('/:id', controller.deleteRule);

export default router;