import fs from 'fs/promises';
import path from 'path';

export default async function deleteTemplate(req) {
    const { id } = req.params;

    try {       
        // Obtêm a pasta de templates
        const templateDir = path.join(process.cwd(), 'src', 'modules', 'templates', 'storage');

        // Lê diretório
        const filePath = path.join(templateDir, `${id}.json`);

        await fs.unlink(filePath);

        return { message: 'Template deletado com sucesso' };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
