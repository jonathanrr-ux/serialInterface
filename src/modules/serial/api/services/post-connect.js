import CustomError from '../../../shared/utils/custom-error.js'
import { getSystemConfig } from '../../../../config/system.js';
import { initSerial } from '../../init.js';
import { getSerialConnection } from '../../core/connection.js';

export default async function postConnect(req) {
    try {       
        // Obtêm a configuração do sistema
        const { settings } = getSystemConfig();
        
        // Obtêm a conexão serial
        const { port } = getSerialConnection();

        if(port?.isOpen) return {};
        
        // Inicia conexão serial
        initSerial({ serialPort: settings.serialPort, baudRate: settings.baudRate });

        return {};
    } catch (err) {
        console.error('Erro connecting serial: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
