import fs from 'fs/promises';
import path from 'path';

export default async function deleteRule(req) {
    const { id, templateId, groupId } = req.params;

    try {       
        // Obtêm a pasta de templates
        const dataDir = path.join(process.cwd(), 'data', `${groupId}.json`);

        // Lê o grupo
        const group = JSON.parse(await fs.readFile(dataDir, "utf8"));
        const template = group.templates.find(t => t.id === templateId);

        // Remove a rule pelo id
        template.rules = template.rules.filter(rule => rule.id !== id);

        // Salva novamente o arquivo
        await fs.writeFile(dataDir, JSON.stringify(group, null, 4), "utf8");

        return { message: 'Regra deletada com sucesso' };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
