import CustomError from '../../../shared/utils/custom-error.js'
import { getSystemConfig } from '../../../../config/system.js';
import { initSerial } from '../../init.js';
import { getSerialConnection } from '../../core/connection.js';
import { LOGS_DEFINITIONS } from '../../../../../public/js/utils/logs-definitions.js';
import { serialLog } from '../../../shared/utils/serial-logger.js';

export default async function postConnect(req) {
    try {       
        // Obtêm a configuração do sistema
        const { settings } = getSystemConfig();
        
        // Obtêm a conexão serial
        const { port } = getSerialConnection();

        if(port?.isOpen) {
            const log = LOGS_DEFINITIONS["error"];
            serialLog({ 
                type:  "error", 
                label: log.label, 
                msg: 'Erro ao iniciar conexão: Porta já aberta'
            }).catch(console.error);

            throw new CustomError();
        }

        if(!settings.serialPort || !settings.baudRate) {
            const log = LOGS_DEFINITIONS["error"];
            serialLog({ 
                type:  "error", 
                label: log.label, 
                msg: 'Erro ao iniciar conexão: Nenhuma configuração serial encontrada'
            }).catch(console.error);

            throw new CustomError();
        }
        
        // Inicia conexão serial
        initSerial({ serialPort: settings.serialPort, baudRate: settings.baudRate });

        return {};
    } catch (err) {
        console.error('Erro connecting serial: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
