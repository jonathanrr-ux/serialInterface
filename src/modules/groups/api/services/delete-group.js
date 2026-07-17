import fs from 'fs/promises';
import path from 'path';

export default async function deleteGroup(req) {
    const { id } = req.params;

    try {       
        // Obtêm a pasta de templates
        const dataDir = path.join(process.cwd(), 'data');

        // Lê diretório
        const filePath = path.join(dataDir, `${id}.json`);

        await fs.unlink(filePath);

        return { message: 'Grupo deletada com sucesso' };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
