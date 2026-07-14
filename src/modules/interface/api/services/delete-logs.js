import CustomError from '../../../shared/utils/custom-error.js'
import fs from 'fs/promises';
import path from 'path';

export default async function deleteLogs(req) {
    const logFile = path.join(process.cwd(), 'logs', 'serial.log');

    try {       
        await fs.writeFile(logFile, '', 'utf8');

        return {};
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
