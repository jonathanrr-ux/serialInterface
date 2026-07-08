import { createSerialConnection, closeSerialConnection, getSerialConnection } from './connection.js';
import { send } from './sender.js';
import { log } from '../modules/shared/utils/logger.js';
import { sendEvent } from './events.js';

// Função para inicializar o serial
function setupSerialEvents() {
    // Conexão serial
    const { port, parser } = getSerialConnection();
    
    // Evento de abertura da comunicação serial
    port.on('open', () => {
        log.success("[serial] Connection started");
    });
    
    // Evento de escuta para para recebimento de dados
    port.on('data', (data) => {
        console.log('RX >', data);

        sendEvent({
            type: 'serial-rx',
            bytes: [...data]
        });
    });

    // Evento de escuta de fechamento da comunicação serial
    port.on('close', async () => {
        log.warn('[serial] Connection closed');
    });
    
    // Evento de escuta de erro no serial
    port.on('error', async (err) => {
        log.error('[serial] Error starting serial connection: ', err);
    });
}

// Função para inicializar a conexão serial
export function initSerial() {
    createSerialConnection();
    setupSerialEvents();
}