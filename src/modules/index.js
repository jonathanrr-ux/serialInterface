import express from 'express';

import { getSystemConfig } from '../config/system.js';

import { web as interfaceWeb, api as interfaceApi } from './interface/index.js';
import { web as settingsWeb, api as settingsApi } from './settings/index.js';
import { api as serialApi } from './serial/index.js';
import { api as rulesApi } from './rules/index.js';
import { api as templatesApi } from './templates/index.js';
import { api as groupsApi } from './groups/index.js';
import { api as autoSendApi } from './auto-send/index.js';

const router = express.Router();

// Redirect root
router.get('/', (req, res) => {
    // Obtêm configuração do sistema
    const { settings } = getSystemConfig();

    // Caso tenha as configurações vai para a home direto
    if (settings?.serialPort !== null && settings?.baudRate !== null) return res.redirect('/home');

    // Se não vai para settings
    return res.redirect('/settings');
});

// Web routes
router.use('/settings', settingsWeb);
router.use('/home', interfaceWeb);

// API routes
router.use('/api/settings', settingsApi);
router.use('/api/serial', serialApi);
router.use('/api/rules', rulesApi);
router.use('/api/templates', templatesApi);
router.use('/api/interface', interfaceApi);
router.use('/api/groups', groupsApi);
router.use('/api/auto-send', autoSendApi);

export default router;