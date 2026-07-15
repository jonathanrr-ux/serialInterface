import fs from 'fs/promises';
import path from 'path';

export async function getRules() {
    // Obtêm a pasta de templates
    const rulesDir = path.join(process.cwd(), 'src', 'modules', 'rules', 'storage');

    // Lê diretório
    const files = await fs.readdir(rulesDir);

    // Carrega todos os templates
    const rules = await Promise.all(
        // Lê conteúdo dos arquivos
        files.map(async file => {
            const content = await fs.readFile(path.join(rulesDir, file), 'utf-8');

            // Retorna em json
            return JSON.parse(content);
        })
    );

    return rules;
}