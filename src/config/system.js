import fs from 'fs';
import path from 'path';

// Caminho do arquivo de configuração .json
const root = process.cwd();
const systemPath = path.join(root, 'src', 'config', 'system.json');

// Função responsável por verificar se o system config existe
function verifySystemConfig() {
    try {
        // Caso não exista
        if (!fs.existsSync(systemPath)) {
            // Cria default config
            const initialConfig = {
                settings: {
                    serialPort: null,
                    baudRate: null,
                    autoReconnect: false
                },
                serial: {
                    connected: false
                }
            };

            // Escreve
            fs.writeFileSync(systemPath, JSON.stringify(initialConfig, null, 4), 'utf-8');

            // Log
            console.info('[system] system.json created');
        }

    } catch (err) {
        // Caso de erro na criação
        console.error('[system] Error creating system.json:', err);
    }
}

// Carrega system config
function loadSystemConfig() {
    try {
        // Obtêm o conteúdo do arquivo
        const content = fs.readFileSync(systemPath, 'utf-8');

        // Verifica se esta vazio
        if (!content.trim()) throw new Error('Empty system.json');

        // Retorna
        return JSON.parse(content);
    } catch (err) {
        // Log
        console.error('[system] Failed to load system.json:', err);

        return {};
    }
}

// Garante que existe
verifySystemConfig();

// Configuração em memória
let systemConfig = loadSystemConfig();

// Recarrega caso alguém altere o arquivo
fs.watchFile(systemPath, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        try {
            systemConfig = loadSystemConfig();

            console.info('[system] Configuration reloaded');

        } catch (err) {
            console.error('[system] Failed to reload config:', err);
        }
    }
});

/**
 * Retorna configuração atual
 */
export function getSystemConfig() {
    return systemConfig;
}

/**
 * Atualiza configuração e salva no arquivo
 */
export function setSystemConfig(newConfig) {
    try {
        systemConfig = {
            ...systemConfig,

            settings: {
                ...systemConfig.settings,
                ...newConfig.settings
            },
            serial: {
                ...systemConfig.serial,
                ...newConfig.serial
            }
        };

        fs.writeFileSync(systemPath, JSON.stringify(systemConfig, null, 4), 'utf-8');

        return systemConfig;
    } catch (err) {
        throw new Error(`Failed to update system configuration: ${err.message}`);
    }
}