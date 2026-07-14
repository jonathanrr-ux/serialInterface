import fs from 'fs/promises';
import path from 'path';

export default async function getTemplates(req) {
    try {       
        // Obtêm a pasta de templates
        const templateDir = path.join(process.cwd(), 'src', 'modules', 'templates', 'saved');

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

        return { data: { templates } };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
