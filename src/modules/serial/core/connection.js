import { ReadlineParser, SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';

// Variáveis globais para controle da porta serial
let port = null;
let parser = null;

// Função para criar a conexão com a porta serial
export function createSerialConnection({ serialPort, baudRate }) {
    // Configuração da porta serial
    port = new SerialPort({ 
        path: serialPort, 
        baudRate
    });
    
    // Parser para a comunicação serial
    parser = port.pipe(new ByteLengthParser({ length: 9 }));
    
    // Retorna dados da comunicação
    return { port, parser };
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
    return { port, parser }
};