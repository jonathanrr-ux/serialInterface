import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por salvar template
router.post('/save', controller.postSaveTemplate);

// Rota responsável por editar template
router.post('/:id/edit', controller.postEditTemplate);

// Rota responsável por deletar template
router.delete('/:id/delete', controller.deleteTemplate);

// Rota responsável por deletar template
router.delete('/delete', controller.deleteAllTemplates);

// Rota responsável por obter templates
router.get('/', controller.getTemplates);


export default router;