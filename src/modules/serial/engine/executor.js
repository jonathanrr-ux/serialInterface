import { send } from '../core/sender.js';

// Função responsável por executar a ação da regra
export async function executeAction({ action, template }) {
    switch (action.type) {
        case "template": 
            // Envia todos pacotes
            for (const packet of template.packets) await send({ bytes: packet.bytes });
            
            break;
        case "packets": 
            // Obtêm os pacotes
            const packets = template.packets.filter(packet => action.packets.includes(packet.id));
            for (const packet of packets) await send({ bytes: packet.bytes });

            break;
        default: return;
    }
}