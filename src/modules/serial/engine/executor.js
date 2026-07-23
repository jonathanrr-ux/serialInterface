import { send } from '../core/sender.js';

// Função responsável por executar a ação da regra
export async function executeAction({ action, template }) {
    switch (action.type) {
        case "template": 
            // Envia todos pacotes
            const packetsT = [...template.packets].sort((a, b) => a.order - b.order);

            for (const packet of packetsT) await send({ bytes: packet.bytes });
            
            break;
        case "packets": 
            // Obtêm os pacotes
            const packets = template.packets.filter(packet => action.packets.some(p => p.id === packet.id)).sort((a, b) => a.order - b.order);
            for (const packet of packets) await send({ bytes: packet.bytes });

            break;
        default: return;
    }
}