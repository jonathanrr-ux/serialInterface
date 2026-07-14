import CustomError from '../../../shared/utils/custom-error.js'
import { closeSerialConnection } from '../../core/connection.js';

export default async function postConnect(req) {
    try {
        // Fecha comunicação serial
        closeSerialConnection();

        return {};
    } catch (err) {
        console.error('Erro stopping serial: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
