import { log } from '../../../shared/utils/logger.js';
import { send } from '../../core/sender.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function postSendBytes(req) {
    // Obtêm os bytes
    const { bytes } = req.body;
    
    // Transforma todos pacotes em array
    const packets = Array.isArray(bytes[0]) ? bytes : [bytes];

    try {    
        // Manda cada array
        for(const packet of packets) {
            // Envia bytes
            const success = send(packet);

            if(!success) throw new CustomError(404, 'Porta fechada');
        }

        return {};
    } catch (err) {
        log.error('Erro sending bytes: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
