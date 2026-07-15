export async function matchCondition({ data, condition }) {
    // Obtêm o valor do dado recebido
    const value = getFieldValue({ data, condition });
    
    // Verifica condições
    switch(condition.operator) {
        case "equal": return equals({ received: value, expected: condition.value });
        case "different": return !equals({ received:value, expected: condition.value });
        default: return false;
    }
}

// Função responsável por obter o byte certo
function getFieldValue({ data, condition }) {
    switch (condition.field) {
        case "sequence": return [...data];

        case "first": return data[0];

        case "last": return data[data.length - 1];

        case "byte": return [...data];

        default: return undefined;
    }
}

// Função responsável por verificar se é igual
function equals({ received, expected }) {
    if (received === undefined) return false;

    // Byte único
    if (typeof received === "number") return received === expected;
    
    // Procurar byte em qualquer posição
    if (Array.isArray(received) && typeof expected === "number") return received.includes(expected);

    // Sequência de bytes
    if (received.length !== expected.length) return false;
    return received.every((byte, index) => {
        return byte === expected[index];
    });
}