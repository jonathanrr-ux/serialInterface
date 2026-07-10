import fs from 'fs/promises';
import path from 'path';
import { getIO } from '../../../sockets/index.js';

// Obtêm a pasta de logs
const logsDir = path.join(process.cwd(), 'logs');
const logFile = path.join(process.cwd(), 'logs', 'serial.log');

// Cria log
export async function serialLog({ type, bytes = null, msg = '', label }) {
    // Garante que a pasta exista
    await fs.mkdir(logsDir, { recursive: true });

    // Cria objeto de log
    const entry = { date: new Date().toISOString(), type, bytes, msg, label };

    // Adiciona ao arquivo
    await fs.appendFile(logFile, JSON.stringify(entry) + '\n');

    // Emite log criado
    getIO()?.emit('serial:status', entry);
}