import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por obter as portas seriais
router.get('/ports', controller.getPorts);

// Rota responsável por conectar serial
router.post('/connect', controller.postConnect);

// Rota responsável por desconectar serial
router.post('/disconnect', controller.postDisconnect);

// Rota responsável por enviar os byes
router.post('/send', controller.postSendBytes);

export default router;