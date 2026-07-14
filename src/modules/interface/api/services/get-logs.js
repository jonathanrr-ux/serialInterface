import CustomError from '../../../shared/utils/custom-error.js'
import fs from 'fs/promises';
import path from 'path';

export default async function getLogs(req) {
    // Obtêm diretórios
    const logsDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logsDir, 'serial.log');

    try {       
        // Cria a pasta se não existir
        await fs.mkdir(logsDir, { recursive: true });

        // Cria o arquivo se não existir
        try {
            await fs.access(logFile);
        } catch {
            await fs.writeFile(logFile, '', 'utf8');
        }

        // Obtêm conteúdo
        const content = await fs.readFile(logFile, 'utf8');

        return { data: { logs: content.split('\n').filter(Boolean).map(JSON.parse) } };
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
