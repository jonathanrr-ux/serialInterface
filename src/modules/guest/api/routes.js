import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por enviar os byes
router.post('/send', controller.postSendBytes);

// Rota responsável por salvar template
router.post('/save', controller.postSaveTemplate);

// Rota responsável por editar template
router.post('/:id/edit', controller.postEditTemplate);

// Rota responsável por deletar template
router.delete('/:id/delete', controller.deleteTemplate);

// Rota responsável por obter templates
router.get('/templates', controller.getTemplates);

export default router;