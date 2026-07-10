import { log } from '../../../shared/utils/logger.js';
import { send } from '../../core/sender.js';
import CustomError from '../../../shared/utils/custom-error.js';
import { serialLog } from '../../../shared/utils/serial-logger.js'; 
import { LOGS_DEFINITIONS } from '../../../../../public/js/utils/logs-definitions.js';

export default async function postSendBytes(req) {
    // Obtêm os bytes
    const { bytes, responseLength } = req.body;
    
    // Transforma todos pacotes em array
    const packets = Array.isArray(bytes[0]) ? bytes : [bytes];

    try {    
        // Manda cada array
        for(const byte of packets) {
            // Envia bytes
            const success = await send({ bytes: byte, responseLength });
            if(!success) {
                const log = LOGS_DEFINITIONS["error"];
                serialLog({ 
                    type:  "error", 
                    label: log.label, 
                    msg: 'Erro ao enviar os dados: Porta fechada'
                }).catch(console.error);

                throw new CustomError();
            }
        }

        return {};
    } catch (err) {
        log.error('Erro sending bytes: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
