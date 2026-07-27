import { SerialPort } from 'serialport';

let currentPorts = [];

// Função responsável por listar portas seriais
export async function listPorts() {
    // Obtêm as portas
    const ports = await SerialPort.list();

    // Retorna informações
    return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer ?? 'Desconhecido',
        serialNumber: port.serialNumber,
        vendorId: port.vendorId,
        productId: port.productId
    }));
}

// Inicia monitoramento das portas
export function startPortWatcher(io) {
    setInterval(async () => {
        const ports = await listPorts();

        const oldPaths = currentPorts.map(p => p.path);
        const newPaths = ports.map(p => p.path);

        const connected = ports.filter(p => !oldPaths.includes(p.path));
        const disconnected = currentPorts.filter(p => !newPaths.includes(p.path));

        if (connected.length) io.emit('serial:connected', connected);
        if (disconnected.length) io.emit('serial:disconnected', disconnected);

        currentPorts = ports;

    }, 1000);
}