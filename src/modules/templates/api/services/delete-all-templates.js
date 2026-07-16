import fs from 'fs/promises';
import path from 'path';

export default async function deleteAllTemplates(req) {
    try {       
        // Obtêm a pasta de templates
        const templateDir = path.join(process.cwd(), 'data', 'templates');

        // Lê todos os arquivos
        const files = await fs.readdir(templateDir);

        // Exclui todos
        await Promise.all(files.map(file => fs.unlink(path.join(templateDir, file))));

        return { message: 'Templates deletados com sucesso' };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
