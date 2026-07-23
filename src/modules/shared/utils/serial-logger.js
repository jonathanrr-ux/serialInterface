import fs from 'fs/promises';
import path from 'path';
import { getIO } from '../../../sockets/index.js';
import { LOGS_DEFINITIONS } from '../../../../public/js/utils/logs-definitions.js';  

// Obtêm a pasta de logs
const logsDir = path.join(process.cwd(), 'logs');
const logFile = path.join(process.cwd(), 'logs', 'serial.log');

let logQueue = Promise.resolve();

// Cria log
export async function serialLog({ type, bytes = null, msg = '', label }) {
    logQueue = logQueue.then(async () => {
        // Garante que a pasta exista
        await fs.mkdir(logsDir, { recursive: true });

        // Cria objeto de log
        const entry = { date: new Date().toISOString(), type, bytes: bytes ? [...bytes] : null, msg, label };

        // Adiciona ao arquivo
        await fs.appendFile(logFile, JSON.stringify(entry) + '\n');

        // Emite log criado
        getIO()?.emit('serial:status', entry);
    });
    return logQueue;
}

// Função responsável por criar o log
export function createLog({ type, msg = '', bytes = null } = {}) {
    // Obtêm a definição do log
    const logDefinition = LOGS_DEFINITIONS[type];
    
    return serialLog({
        type,
        label: logDefinition.label,
        msg: logDefinition.msg ?? msg ?? '',
        bytes
    }).catch(console.error);
}