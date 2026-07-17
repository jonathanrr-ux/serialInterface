import CustomError from '../../../shared/utils/custom-error.js'
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export default async function postRule(req) {
    // Obtêm as regras
    const { rules } = req.body;
    const { id, groupId } = req.params;
    
    try {       
        // Obtêm a pasta de templates
        const dataDir = path.join(process.cwd(), 'data', `${groupId}.json`);

        // Lê o grupo
        const group = JSON.parse(await fs.readFile(dataDir, "utf8"));

        const template = group.templates.find(t => t.id === id);
        
        template.rules = rules.map(rule => ({
            ...rule,
            id: rule.id ?? randomUUID()
        }));
        
        // Salva o template atualizado
        await fs.writeFile(dataDir, JSON.stringify(group, null, 4), "utf8");

        return { message: 'Regra salva com sucesso', data: { rules: template.rules } };
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
