import { log } from '../../../shared/utils/logger.js';
import CustomError from '../../../shared/utils/custom-error.js'
import { setSystemConfig } from '../../../../config/system.js';

export default async function postConfig(req) {
    // Obtêm as informações da req
    const { serialPort, baudRate, autoReconnect } = req.body;

    try {    
        // Atualiza informações do sistema
        setSystemConfig({ settings: { serialPort, baudRate: Number(baudRate), autoReconnect } });

        return { message: 'Configurações salvas com sucesso' };
    } catch (err) {
        log.error('Erro saving config: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
