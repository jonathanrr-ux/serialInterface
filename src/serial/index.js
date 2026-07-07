import { createSerialConnection, closeSerialConnection, getSerialConnection } from './connection.js';
import { send } from './sender.js';
import { log } from '../utils/logger.js';
// import handleSerialOpen from './events/serial-open.js';
// import { handleSerialData, resetCommunicationWatchdog } from './events/serial-data.js';
// import createWriter from './writers/locker-writer.js';

// Função para inicializar o serial
function setupSerialEvents() {
    // Conexão serial
    const { port, parser } = getSerialConnection();

    // Funções de escrita do serial
    // currentWriters = createWriter(port);
    
    // Evento de abertura da comunicação serial
    port.on('open', () => {
        log.success("[serial] Connection started");

        send([
            0xFF,
            0x01,
            0x02,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x01
        ]);
    });
    
    // Evento de escuta para para recebimento de dados
    parser.on('data', (data) => {
        // handleSerialData(data);
        console.log(data)
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