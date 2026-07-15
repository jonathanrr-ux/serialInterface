import { send } from '../../core/sender.js';
import CustomError from '../../../shared/utils/custom-error.js';
import { serialLog } from '../../../shared/utils/serial-logger.js'; 
import { LOGS_DEFINITIONS } from '../../../../../public/js/utils/logs-definitions.js';
import { getSerialConnection } from '../../core/connection.js';

export default async function postSendBytes(req) {
    // Obtêm os bytes
    const { bytes, responseLength } = req.body;

    // Obtêm a porta da conexão serial
    const { port } = getSerialConnection();

    // Verifica se a porta está aberta
    if(!port?.isOpen) {
        const log = LOGS_DEFINITIONS["error"];
        serialLog({ 
            type:  "error", 
            label: log.label, 
            msg: 'Erro ao enviar os dados: Porta fechada'
        }).catch(console.error);

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
