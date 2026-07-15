import { createSerialConnection, closeSerialConnection, getSerialConnection, getNewParser } from './core/connection.js';
import { send } from './core/sender.js';
import { setSystemConfig } from '../../config/system.js';
import { handleData } from '../serial/core/handler.js';
import { getIO } from '../../sockets/index.js';
import { serialLog } from '../shared/utils/serial-logger.js';
import { LOGS_DEFINITIONS } from '../../../public/js/utils/logs-definitions.js';

// Função para inicializar o serial
async function setupSerialEvents() {
    // Conexão serial
    const { port } = getSerialConnection();
    const parser = getNewParser();
    
    port.on('open', () => {
        // Salva configuração
        setSystemConfig({ serial: { connected: true } });
        
        // Emite socket para enviar a conexão aberta
        getIO()?.emit('serial:open', { port: port.settings.path, baudRate: port.settings.baudRate });

        // Log
        const log = LOGS_DEFINITIONS["connection-started"];
        serialLog({ 
            type: "connection-started", 
            label: log.label, 
            msg: log.msg 
        }).catch(console.error);
    });
    
    // Evento de escuta para para recebimento de dados
    parser.on('data', handleData);

    // Evento de escuta de fechamento da comunicação serial
    port.on('close', async () => {
        setSystemConfig({ serial: { connected: false } });

        getIO()?.emit('serial:close');

        // Log
        const log = LOGS_DEFINITIONS["connection-closed"];
        serialLog({ 
            type: "connection-closed", 
            label: log.label, 
            msg: log.msg 
        }).catch(console.error);
    });
    
    // Evento de escuta de erro no serial
    port.on('error', async (err) => {
        // Cria log
        const log = LOGS_DEFINITIONS["error"];
        serialLog({ 
            type: "error", 
            label: log.label,
            msg: err.message
        }).catch(console.error);
    });
}

// Função para inicializar a conexão serial
export function initSerial({ serialPort, baudRate }) {
    createSerialConnection({ serialPort, baudRate });
    setupSerialEvents();
}