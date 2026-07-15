import { getTemplates } from "../../../shared/utils/templates.js";
import { send } from "../../core/sender.js";

// Função responsável por enviar todo template
export async function executeTemplate({ action }) {
    // Obtêm os templates
    const templates = await getTemplates();

    // Acha o template correspondente
    const template = templates.find(t => t.id === action.templateId);
    if (!template) return;

    // Envia todos pacotes
    for (const packet of template.packets) {
        await send({ bytes: packet.bytes });
    }
}