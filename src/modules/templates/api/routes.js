import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por salvar template
router.post('/', controller.postTemplate);

// Rota responsável por pacotes do template
router.put('/:id/group/:groupId/packets', controller.putTemplatePackets);

// Rota responsável por editar informações do template
router.put('/:id/group/:groupId', controller.putTemplate);

// Rota responsável por deletar template
router.delete('/:id/group/:groupId', controller.deleteTemplate);

// // Rota responsável por deletar template
// router.delete('/delete', controller.deleteAllTemplates);

export default router;