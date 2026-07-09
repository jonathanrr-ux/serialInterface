import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota responsável por enviar os byes
router.post('/send', controller.postSendBytes);


// Rota responsável pro mandar o data
router.get('/serial/events', controller.getSerialEvents);

export default router;