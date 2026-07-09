import { SerialPort } from 'serialport';

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