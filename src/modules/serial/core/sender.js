import { getSerialConnection } from "./connection.js";
import { serialLog } from '../../shared/utils/serial-logger.js';
import { LOGS_DEFINITIONS } from "../../../../public/js/utils/logs-definitions.js";

// Função responsável por enviar buffer
export async function send({ bytes, responseLength }) {
    // Obtêm a porta da conexão serial
    const { port } = getSerialConnection();

    // Manda buffer
    const buffer = Buffer.from(bytes); 

    // Cria log
    const log = LOGS_DEFINITIONS["tx"];
    serialLog({ 
        type: "tx", 
        label: log.label, 
        bytes
    }).catch(console.error);

    // Escreve
    port.write(buffer);
}