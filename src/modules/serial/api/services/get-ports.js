import CustomError from '../../../shared/utils/custom-error.js'
import { listPorts } from '../../core/ports.js';

export default async function getSerialPorts(req) {
    try {       
        // Obtêm as portas seriais
        const ports = await listPorts();

        return { data: { ports } };
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError()) throw err;
        else throw new CustomError();
    }
}
