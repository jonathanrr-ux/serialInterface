import CustomError from '../../../shared/utils/custom-error.js'
import { setSystemConfig } from '../../../../config/system.js';
import { response } from 'express';

export default async function postConfig(req) {
    // Obtêm as informações da req
    const { serialPort, baudRate, responseLength } = req.body;

    try {    
        const settings = {};

        // Verifica opções
        if (serialPort !== undefined) settings.serialPort = serialPort;
        if (baudRate !== undefined) settings.baudRate = Number(baudRate);
        if (responseLength !== undefined) settings.responseLength = responseLength;

        // Atualiza configurações
        setSystemConfig({ settings });

        return { message: 'Configurações salvas com sucesso' };
    } catch (err) {
        console.error('Erro saving config: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
