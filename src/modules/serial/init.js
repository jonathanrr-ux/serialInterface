import { createSerialConnection, closeSerialConnection, getSerialConnection, getNewParser } from './core/connection.js';
import { send } from './core/sender.js';
import { setSystemConfig, getSystemConfig } from '../../config/system.js';
import { handleData, handleOpen, handleClose } from '../serial/core/handler.js';
import { getIO } from '../../sockets/index.js';
import { createLog } from '../shared/utils/serial-logger.js';
import { LOG_TYPES } from '../../../public/js/utils/logs-definitions.js';


// Função para inicializar o serial
async function setupSerialEvents() {
    const system = getSystemConfig();
    // Conexão serial
    const { port } = getSerialConnection();
    const parser = getNewParser({ byteLength: system.settings.responseLength ?? 9 });
    
    port.on('open', async() => {
        // Log
        createLog({ type: LOG_TYPES.CONNECTION_STARTED });

        // Salva configuração
        setSystemConfig({ serial: { connected: true } });
        
        // Tenta iniciar os auto envios
        const started = await handleOpen();
        
        // Emite socket para enviar a conexão aberta
        getIO()?.emit('serial:open', { port: port.settings.path, baudRate: port.settings.baudRate, autoSends: started });
    });
    
    // Evento de escuta para para recebimento de dados
    parser.on('data', handleData);

    // Evento de escuta de fechamento da comunicação serial
    port.on('close', async () => {
        setSystemConfig({ serial: { connected: false } });

        getIO()?.emit('serial:close');

        // Log
        createLog({ type: LOG_TYPES.CONNECTION_CLOSED });
        
        // Fecha todos auto envio
        handleClose();
    });
    
    // Evento de escuta de erro no serial
    port.on('error', async (err) => {
        // Cria log
        createLog({ type: LOG_TYPES.ERROR, msg: err.message });

        // Fecha todos auto envio
        handleClose();
    });
}

// Função para inicializar a conexão serial
export function initSerial({ serialPort, baudRate }) {
    createSerialConnection({ serialPort, baudRate });
    setupSerialEvents();
}