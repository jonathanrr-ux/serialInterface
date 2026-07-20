import fs from 'fs/promises';
import path from 'path';

export default async function deleteTemplate(req) {
    const { id, groupId } = req.params;
    try {       
        // Obtêm a pasta de templates
        const dataDir = path.join(process.cwd(), 'data', `${groupId}.json`);

        // Lê o grupo
        const group = JSON.parse(await fs.readFile(dataDir, "utf8"));

        // Remove o template pelo id
        group.templates = group.templates.filter(temp => temp.id !== id);

        // Salva novamente o arquivo
        await fs.writeFile(dataDir, JSON.stringify(group, null, 4), "utf8");

        return { message: 'Template deletado com sucesso' };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
