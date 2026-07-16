import fs from 'fs/promises';
import path from 'path';

export default async function deleteRules(req) {
    try {       
        // Obtêm a pasta de templates
        const rulesDir = path.join(process.cwd(), 'data', 'rules');

        // Lê todos os arquivos
        const files = await fs.readdir(rulesDir);

        // Exclui todos
        await Promise.all(files.map(file => fs.unlink(path.join(rulesDir, file))));

        return { message: 'Regras deletadas com sucesso' };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
