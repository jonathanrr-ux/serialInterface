import { serialLog } from "../../shared/utils/serial-logger.js";
import { LOGS_DEFINITIONS } from "../../../../public/js/utils/logs-definitions.js";

// Função responsável por tratar resposta
export function handleData(data) {  
    // Loga a resposta completa
    const log = LOGS_DEFINITIONS["rx"];
    serialLog({ 
        type:  "rx", 
        label: log.label, 
        bytes: [...data]
    }).catch(console.error);
}