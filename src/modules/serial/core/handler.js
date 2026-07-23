import { createLog } from "../../shared/utils/serial-logger.js";
import { LOG_TYPES } from "../../../../public/js/utils/logs-definitions.js";
import { matchCondition } from "../engine/matcher.js";
import { executeAction } from "../engine/executor.js";
import { getRules } from '../../shared/utils/rules.js';
import { getAutoSends } from '../../shared/utils/auto-sends.js';
import autoSendService from '../../shared/utils/auto-send/service.js';
import db from "../../../db/models/index.js";
import { getIO } from "../../../sockets/index.js";

// Função responsável por tratar resposta
export async function handleData(data) {
    // Loga a resposta completa
    createLog({ type: LOG_TYPES.RX, bytes: [...data] });

    // Obtêm todas regras
    const rules = await getRules();
    
    // Itera nas regras
    for (const rule of (rules ?? [])) {
        // Caso a regra não esteja ativada continua
        if (!rule.enabled) continue;

        // Caso não feche a com a ação disponível continua
        if (!await matchCondition({ data, condition: rule.condition })) continue;

        // Executa ação
        await executeAction({ action: rule.action, template: rule.template });
    }
}

// Função para tentar iniciar auto envios ao abrir
export async function handleOpen() {
    // Busca os auto sends
    const autoSends = await getAutoSends();

    const started = [];

    // Inicia todos
    for(const autoSend of autoSends) {
        // Obtêm o resultado do auto send
        const result = autoSendService.start(autoSend);

        // Caso não obtenha sucesso
        if (!result.success) {
            createLog({ type: LOG_TYPES.AUTO_SEND_ERROR, msg: result.message });
            continue;
        }

        // Cria log
        createLog({ type: LOG_TYPES.AUTO_SEND_STARTED, msg: result.message });
        await db.AutoSend.update({ enabled: true }, { where: { id: autoSend.id } });

        started.push(autoSend.id);
    }

    // Emite status que iniciou
    autoSendService.emitStatus();

    return started;
}

// Função responsável por gerenciar o fechamento da porta
export async function handleClose() {
    // Para todos auto envios
    const result = autoSendService.stopAll();
    
    // Cria log
    createLog({ type: LOG_TYPES.AUTO_SEND_STOPPED, msg: result.message });

    // Atualiza todos autoSend
    await db.AutoSend.update({ enabled: false }, { where: { enabled: true } });

    // Emite status
    autoSendService.emitStatus();
}