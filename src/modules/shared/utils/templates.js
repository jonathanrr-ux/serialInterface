import fs from 'fs/promises';
import path from 'path';

export async function getTemplates() {
    // Obtêm a pasta de templates
    const templateDir = path.join(process.cwd(), 'src', 'modules', 'templates', 'storage');

    // Lê diretório
    const files = await fs.readdir(templateDir);

    // Carrega todos os templates
    const templates = await Promise.all(
        // Lê conteúdo dos arquivos
        files.map(async file => {
            const content = await fs.readFile(path.join(templateDir, file), 'utf-8');

            // Retorna em json
            return JSON.parse(content);
        })
    );

    return templates;
}