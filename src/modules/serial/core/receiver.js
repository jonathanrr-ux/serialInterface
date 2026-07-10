import { serialLog } from "../../shared/utils/serial-logger.js";
import { LOGS_DEFINITIONS } from "../../../../public/js/utils/logs-definitions.js";

// Variáveis auxiliares
let buffer = Buffer.alloc(0);
let expectedLength = null;
let resolveResponse = null;

// Função responsável por obter o tamanho
export function setExpectedLength(length) {
    expectedLength = length;
}

// Função responsável por esperar resposta
export function waitResponse() {
    return new Promise(resolve => {
        resolveResponse = resolve;
    });
}

// Função responsável por tratar resposta
export function handleData(data) {
    // Concatena no buffer
    buffer = Buffer.concat([buffer, data]);

    // Caso não tiver tamanho esperado
    if (!expectedLength) return;
    if (buffer.length < expectedLength) return;

    // Obtêm a resposta
    const response = buffer.subarray(0, expectedLength);

    // Pega somente os número esperados
    buffer = buffer.subarray(expectedLength);
    
    // Loga a resposta completa
    const log = LOGS_DEFINITIONS["rx"];
    serialLog({ 
        type:  "rx", 
        label: log.label, 
        bytes: [...response]
    }).catch(console.error);

    // Limpa variável
    expectedLength = null;

    // Adiciona resposta
    resolveResponse?.(response);
    resolveResponse = null;
}