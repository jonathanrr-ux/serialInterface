import fs from 'fs/promises';
import path from 'path';

export default async function deleteRule(req) {
    const { id } = req.params;

    try {       
        // Obtêm a pasta de templates
        const rulesDir = path.join(process.cwd(), 'src', 'modules', 'rules', 'storage');

        // Lê diretório
        const filePath = path.join(rulesDir, `${id}.json`);

        await fs.unlink(filePath);

        return { message: 'Regra deletada com sucesso' };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
