import { executePackets } from "./packets.js";
import { executeTemplate } from "./template.js";

// Função responsável por executar a ação da regra
export async function executeAction({ action }) {
    switch (action.type) {
        case "template": return executeTemplate({ action });
        case "packets": return executePackets({ action });
        default: return;
    }
}