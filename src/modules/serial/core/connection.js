import { ByteLengthParser, ReadlineParser, SerialPort } from 'serialport';
import { getSystemConfig } from '../../../config/system.js';

// Variáveis globais para controle da porta serial
let port = null;
let parser = null;
const system = getSystemConfig();

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

    if (parser) {
        parser.removeAllListeners();
        port.unpipe(parser);
        parser = null;
    }

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

// Função para obter novo parser
export function getNewParser({ byteLength = 9 } = {}) {
    if (parser) {
        parser.removeAllListeners();
        port.unpipe(parser);
    }

    parser = new ByteLengthParser({ length: system.settings.responseLength || byteLength });
    port.pipe(parser);

    return parser;
}