import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por obter os templates
router.get('/', controller.getTemplates);

// Rota responsável por salvar template
router.post('/', controller.postTemplate);

// Rota responsável por obter o conteúdo de um template
router.get('/:id/content', controller.getTemplateContent);

// Rota responsável por pacotes do template
router.put('/:id/packets', controller.putTemplatePackets);

// Rota responsável por editar informações do template
router.put('/:id', controller.putTemplate);

// Rota responsável por deletar template
router.delete('/:id', controller.deleteTemplate);

// Rota responsável por copiar template
router.post('/:id/copy', controller.postCopyTemplate);

export default router;