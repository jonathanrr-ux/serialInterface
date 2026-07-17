import CustomError from '../../../shared/utils/custom-error.js'
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export default async function postGroup(req) {
    // Obtêm as regras
    const { icon, color, name, description } = req.body;
    
    try {       
        // Obtêm a pasta de rules
        const dataDir = path.join(process.cwd(), 'data');

        // Cria a pasta caso não exista
        await fs.mkdir(dataDir, { recursive: true });

        // Cria um uuid para o grupo
        const id = randomUUID();

        // Cria escopo do grupo
        const group = { id, name, description, icon, color, templates: [] };

        // Escreve no arquivo
        await fs.writeFile(path.join(process.cwd(), 'data', `${id}.json`), JSON.stringify(group, null, 4));

        return { message: 'Grupo salvo com sucesso', data : { group } };
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
