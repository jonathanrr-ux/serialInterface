import { log } from '../../../shared/utils/logger.js';
import CustomError from '../../../shared/utils/custom-error.js'
import fs from 'fs/promises';
import path from 'path';

export default async function getLogs(req) {
    const logFile = path.join(process.cwd(), 'logs', 'serial.log');

    try {       
        const content = await fs.readFile(logFile, 'utf8');

        return { data: { logs: content.split('\n').filter(Boolean).map(JSON.parse) } };
    } catch (err) {
        log.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
