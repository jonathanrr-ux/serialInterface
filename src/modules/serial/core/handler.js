import { serialLog } from "../../shared/utils/serial-logger.js";
import { LOGS_DEFINITIONS } from "../../../../public/js/utils/logs-definitions.js";
import { getRules } from '../../shared/utils/rules.js';
import { matchCondition } from "../engine/matcher.js";
import { executeAction } from "../engine//executor/index.js";

// Função responsável por tratar resposta
export async function handleData(data) {
    // Loga a resposta completa
    const log = LOGS_DEFINITIONS["rx"];
    serialLog({ 
        type:  "rx", 
        label: log.label, 
        bytes: [...data]
    }).catch(console.error);

    // Obtêm todas regras
    const rules = await getRules();
    
    // Itera nas regras
    for (const rule of rules) {
        // Caso a regra não esteja ativada continua
        if (!rule.enabled) continue;

        // Caso não feche a com a ação disponível continua
        if (!await matchCondition({ data, condition: rule.condition })) continue;

        // Executa ação
        await executeAction({ action: rule.action });
    }
}