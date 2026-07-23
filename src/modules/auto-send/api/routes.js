import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por salvar os auto envios
router.post('/:id/template', controller.postAutoSend);

// Rota responsável por deletar uma regra
router.delete('/:id', controller.deleteAutoSend);

// Rota responsável por iniciar o auto envio
router.post('/:id/start', controller.postStartAutoSend);

// Rota responsável por iniciar o auto envio
router.post('/:id/stop', controller.postStopAutoSend);

export default router;