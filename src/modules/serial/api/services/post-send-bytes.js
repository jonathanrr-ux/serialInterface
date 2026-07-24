import { send } from '../../core/sender.js';
import CustomError from '../../../shared/utils/custom-error.js';
import { createLog } from '../../../shared/utils/serial-logger.js'; 
import { LOG_TYPES } from '../../../../../public/js/utils/logs-definitions.js';
import { getSerialConnection } from '../../core/connection.js';

export default async function postSendBytes(req) {
    // Obtêm os bytes
    const { bytes, responseLength } = req.body;

    // Obtêm a porta da conexão serial
    const { port } = getSerialConnection();

    // Verifica se a porta está aberta
    if(!port?.isOpen) {
        // Cria log
        createLog({ type: LOG_TYPES.ERROR, msg: 'Erro ao enviar os dados: Porta fechada' });
        throw new CustomError();
    }
    
    // Transforma todos pacotes em array
    const packets = Array.isArray(bytes[0]) ? bytes : [bytes];
    
    try {    
        // Manda cada array
        for(const byte of packets) {
            // Envia bytes
            await send({ bytes: byte });
        }

        return {};
    } catch (err) {
        console.error('Erro sending bytes: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
