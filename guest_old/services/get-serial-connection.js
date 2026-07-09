import { log } from '../../shared/utils/logger.js';
import { getSerialConnection } from '../../../serial/connection.js';

export default async function getSerialConnectionPort(req) {
    try {    
        // Obtêm a informação da porta serial
        const { port } = getSerialConnection();

        return { connected: port?.isOpen ?? false }
    } catch (err) {
        log.error('Erro getting serial connection information: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}