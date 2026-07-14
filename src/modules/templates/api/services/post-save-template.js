import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export default async function postSaveTemplate(req) {
    // Obtêm o nome e pacote a salvar
    const { name } = req.body
    
    try {       
        // Obtêm a pasta de templates
        const templateDir = path.join(process.cwd(), 'src', 'modules', 'templates', 'saved');

        // Cria a pasta caso não exista
        await fs.mkdir(templateDir, { recursive: true });

        // Cria um uuid para o template
        const id = randomUUID();

        // Cria escopo to template
        const template = { id, name, packets: [] };

        // Escreve no arquivo
        await fs.writeFile(
            path.join(process.cwd(), 'src', 'modules', 'templates', 'saved', `${id}.json`),
            JSON.stringify(template, null, 4)
        );

        return { data: { template }, message: 'Template adicionado com sucesso' };
    } catch (err) {
        console.error('Erro saving template: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
