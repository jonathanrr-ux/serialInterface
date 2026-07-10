import { ReadlineParser, SerialPort } from 'serialport';

// Variáveis globais para controle da porta serial
let port = null;

// Função para criar a conexão com a porta serial
export function createSerialConnection({ serialPort, baudRate }) {
    // Configuração da porta serial
    port = new SerialPort({ 
        path: serialPort, 
        baudRate
    });
    
    // Retorna dados da comunicação
    return { port };
};

// Função para fechar a conexão com a porta serial
export async function closeSerialConnection() {
    // Verifica se a porta serial está ativa
    if (!port?.isOpen) return;

    await new Promise((resolve, reject) =>{
        port.close(err => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Função para obter a instância atual
export function getSerialConnection() {
    return { port }
};