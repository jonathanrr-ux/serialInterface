import CustomError from '../../../shared/utils/custom-error.js'
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export default async function postRule(req) {
    // Obtêm as regras
    const { rules } = req.body;
    const { id } = req.params;
    
    try {       
        // Obtêm a pasta de rules
        const templateDir = path.join(process.cwd(), 'data', 'templates');
        const file = path.join(templateDir, `${id}.json`);

        // Lê o template
        const template = JSON.parse(await fs.readFile(file, 'utf8'));
        
        // Garante ID para regras novas
        template.rules = rules.map(rule => ({ ...rule, id: rule.id ?? randomUUID() }));
        
        // Salva o template atualizado
        await fs.writeFile(file, JSON.stringify(template, null, 4), 'utf8');

        return { message: 'Regra salva com sucesso', data: { rules: template.rules } };
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
