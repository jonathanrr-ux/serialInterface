import { getTemplates } from "../../../shared/utils/templates.js";
import { send } from "../../core/sender.js";

// Função responsável por executar os pacotes
export async function executePackets({ action }) {
    // Obtêm os templates
    const templates = await getTemplates();

    // Acha o template correspondente
    const template = templates.find(t => t.id === action.templateId);
    if (!template) return;

    // Obtêm os pacotes
    const packets = template.packets.filter(packet => action.packets.includes(packet.id));

    for (const packet of packets) await send({ bytes: packet.bytes });
}