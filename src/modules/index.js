import express from 'express';

import { web as guestWeb, api as guestApi } from './guest/index.js';

const router = express.Router();

// Web routes
router.use('/', guestWeb);

// API routes
router.use('/api/guest', guestApi);

export default router;