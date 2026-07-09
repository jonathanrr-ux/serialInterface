import { createSerialConnection, closeSerialConnection, getSerialConnection } from './core/connection.js';
import { send } from './core/sender.js';
import { log } from '../shared/utils/logger.js';
import { sendEvent } from './core/events.js';
import { setSystemConfig } from '../../config/system.js';
import { getIO } from '../../sockets/index.js';

// Função para inicializar o serial
function setupSerialEvents() {
    // Conexão serial
    const { port, parser } = getSerialConnection();
    
    port.on('open', () => {
        // Salva configuração
        setSystemConfig({ serial: { connected: true } });
        
        // Emite socket para enviar a conexão aberta
        getIO()?.emit('serial:open', { port: port.settings.path, baudRate: port.settings.baudRate });

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
        setSystemConfig({ serial: { connected: false } });

        getIO()?.emit('serial:close');

        log.warn('[serial] Connection closed');
    });
    
    // Evento de escuta de erro no serial
    port.on('error', async (err) => {
        log.error('[serial] Error starting serial connection: ', err);
    });
}

// Função para inicializar a conexão serial
export function initSerial({ serialPort, baudRate }) {
    createSerialConnection({ serialPort, baudRate });
    setupSerialEvents();
}