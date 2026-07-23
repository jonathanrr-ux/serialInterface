import { getNewParser } from '../../core/connection.js';
import { handleData } from '../../core/handler.js';
import CustomError from '../../../shared/utils/custom-error.js';
import { createLog } from '../../../shared/utils/serial-logger.js'; 
import { LOG_TYPES } from '../../../../../public/js/utils/logs-definitions.js';
import { getSerialConnection } from '../../core/connection.js';

export default async function postSendBytes(req) {
    // Obtêm os bytes
    const { byteLength } = req.body;

    const { port } = getSerialConnection();
    
    try {    
        if (!port || !port.isOpen) {
            // Cria log
            createLog({ type: LOG_TYPES.ERROR, msg: 'Erro ao alterar tamanho da resposta: Nenhuma porta aberta' });
            throw new CustomError();
        }

        // Altera o comprimento dos bytes de recebimento
        const parser = getNewParser({ byteLength });
        parser.on('data', handleData);

        return {};
    } catch (err) {
        console.error('Erro changing serial byte length: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
