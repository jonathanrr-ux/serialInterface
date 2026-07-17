import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por salvar template
router.post('/', controller.postTemplate);

// Rota responsável por editar template
router.put('/:id/group/:groupId', controller.putTemplate);

// // Rota responsável por deletar template
// router.delete('/:id/delete', controller.deleteTemplate);

// // Rota responsável por deletar template
// router.delete('/delete', controller.deleteAllTemplates);

export default router;