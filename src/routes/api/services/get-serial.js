import { log } from '../../../utils/logger.js';
import { getSerialConnection } from '../../../serial/connection.js';

export default async function getSerial(req) {
    try{
        // Obtêm a porta da conexão serial
        const { port } = getSerialConnection();

        

        return {}
    }catch (err) {
        log.error('Erro getting serial port: ', err);

        throw new Error(`Erro ao obter porta serial: ${err.message}`);
    }
}