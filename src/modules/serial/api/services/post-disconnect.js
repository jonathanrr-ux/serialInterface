import { log } from '../../../shared/utils/logger.js';
import CustomError from '../../../shared/utils/custom-error.js'
import { setSystemConfig } from '../../../../config/system.js';
import { closeSerialConnection } from '../../core/connection.js';

export default async function postConnect(req) {
    try {
        // Fecha comunicação serial
        closeSerialConnection();
        setSystemConfig({ serial: { connected: false } });

        return {};
    } catch (err) {
        log.error('Erro stopping serial: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
