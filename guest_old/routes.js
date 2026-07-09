import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

// Rota home
router.get('/home', controller.getHome);

export default router;