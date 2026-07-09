import { log } from '../../../shared/utils/logger.js';
import CustomError from '../../../shared/utils/custom-error.js'
import { getSystemConfig } from '../../../../config/system.js';

export default async function getConfig(req) {
    try {    
        // Obtêm as configurações do sistema
        const { settings } = getSystemConfig();

        return { data: { settings } };
    } catch (err) {
        log.error('Erro getting config: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
