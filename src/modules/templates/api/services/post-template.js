import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export default async function postTemplate(req) {
    // Obtêm o nome e pacote a salvar
    const { name, description, group } = req.body
    
    try {       
        // Obtêm a pasta de templates
        const dataDir = path.join(process.cwd(), 'data', `${group}.json`);

        // Lê o grupo
        const content = await fs.readFile(dataDir, 'utf-8');
        const groupData = JSON.parse(content);

        // Cria o template
        const template = {
            id: randomUUID(),
            name,
            description,
            packets: [],
            rules: []
        };

        // Adiciona ao grupo
        groupData.templates.push(template);

        // Salva o grupo novamente
        await fs.writeFile(dataDir, JSON.stringify(groupData, null, 4));

        return { data: { template }, message: 'Template adicionado com sucesso' };
    } catch (err) {
        console.error('Erro saving template: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
