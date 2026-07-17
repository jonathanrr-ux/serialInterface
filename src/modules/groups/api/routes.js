import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

router.get('/', controller.getGroups);

router.post('/', controller.postGroup);

router.put('/:id', controller.putGroup);

router.delete('/:id', controller.deleteGroup);

export default router;