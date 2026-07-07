import { getSerialConnection } from "./connection.js";

export function send(bytes) {
    // Obtêm a porta da conexão serial
    const { port } = getSerialConnection();

    // Verifica se a porta está aberta
    if(!port?.isOpen) {
        console.log("[serial] Porta fechada");
        return;
    }

    // Manda buffer
    const buffer = Buffer.from(bytes);

    console.log("TX >", buffer);

    // Escreve
    port.write(buffer);
}