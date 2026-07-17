import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por salvar as regras
router.post('/:id/template/:groupId/group', controller.postTemplateRule);

// Rota responsável por deletar todas regras
router.delete('/', controller.deleteRules);

// Rota responsável por deletar uma regra
router.delete('/:id/template/:templateId/group/:groupId', controller.deleteRule);

export default router;