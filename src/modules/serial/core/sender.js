import { getSerialConnection } from "./connection.js";
import { createLog } from '../../shared/utils/serial-logger.js';
import { LOG_TYPES } from "../../../../public/js/utils/logs-definitions.js";

// Função responsável por enviar buffer
export async function send({ bytes }) {
    // Obtêm a porta da conexão serial
    const { port } = getSerialConnection();

    // Manda buffer
    const buffer = Buffer.from(bytes); 

    // Cria log
    createLog({ type: LOG_TYPES.TX, bytes });

    // Escreve
    port.write(buffer)
}