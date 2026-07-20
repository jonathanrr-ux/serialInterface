import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export default async function putTemplate(req) {
    // Obtêm o nome e pacote a salvar
    let { packet } = req.body;
    const { id, groupId } = req.params;
    
    try {       
        // Obtêm a pasta de templates
        const groupPath = path.join(process.cwd(), 'data', `${groupId}.json`);
        
        // Adiciona id aos novos pacotes
        packet = packet.map(p => ({
            ...p,
            id: p.id ?? randomUUID()
        }));
        
        // Lê o grupo
        const group = JSON.parse(await fs.readFile(groupPath, 'utf8'));
        
        // Procura o template
        const template = group.templates.find(t => t.id === id);

        // Atualiza os pacotes
        template.packets = packet;

        // Salva o grupo
        await fs.writeFile(groupPath, JSON.stringify(group, null, 4));
        
        return { data: { template }, message: 'Template editado com sucesso' };
    } catch (err) {
        console.error('Erro saving template: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
