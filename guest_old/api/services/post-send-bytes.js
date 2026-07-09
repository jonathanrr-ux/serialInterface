import { log } from '../../../shared/utils/logger.js';
import { send } from '../../../../serial/sender.js';

export default async function postSendBytes(req) {
    // Obtêm os bytes
    const { bytes } = req.body;
    
    // Transforma todos pacotes em array
    const packets = Array.isArray(bytes[0]) ? bytes : [bytes];

    try {    
        // Manda cada array
        for(const packet of packets) {
            // Envia bytes
            send(packet);
        }

        return {};
    } catch (err) {
        log.error('Erro sending bytes: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
