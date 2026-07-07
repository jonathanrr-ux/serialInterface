import express from 'express';
import path from 'path';

const router = express.Router();

// Rota /
router.get('/', (req, res) => { res.sendFile(path.join(process.cwd(), '../../views/index.html')) });

export default router;