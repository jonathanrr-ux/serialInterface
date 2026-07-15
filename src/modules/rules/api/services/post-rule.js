import CustomError from '../../../shared/utils/custom-error.js'
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export default async function postRule(req) {
    // Obtêm as regras
    const { rules } = req.body;
    
    try {       
        // Obtêm a pasta de rules
        const ruleDir = path.join(process.cwd(), 'src', 'modules', 'rules', 'storage');

        // Cria a pasta caso não exista
        await fs.mkdir(ruleDir, { recursive: true });

        const savedRules = [];

        // Salva as regras
        for (const rule of rules) {
            const id = rule.id ?? randomUUID();

            const ruleData = { ...rule, id };

            const file = path.join(ruleDir, `${id}.json`);
            await fs.writeFile(file, JSON.stringify(ruleData, null, 4), 'utf8');

            savedRules.push(ruleData);
        }

        return { message: 'Regra salva com sucesso', data: { rules: savedRules } };
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
