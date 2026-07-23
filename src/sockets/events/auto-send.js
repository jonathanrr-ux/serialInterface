import autoSendService from '../../modules/shared/utils/auto-send/service.js';
import { getIO } from '../index.js';

export default function initAutoSendEvents() {

    if (globalThis.autoSendEventsInitialized) return;
    globalThis.autoSendEventsInitialized = true;

    autoSendService.on('updated', data => {
        const io = getIO();
        if (!io) return;

        io.emit('autoSend:update', data);
    });

    autoSendService.on('status', data => {
        const io = getIO();
        if (!io) return;

        io.emit('autoSend:status', data);
    });

}