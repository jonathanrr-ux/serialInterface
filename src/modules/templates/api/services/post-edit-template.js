import fs from 'fs/promises';
import path from 'path';

export default async function postEditTemplate(req) {
    // Obtêm o nome e pacote a salvar
    const { packet } = req.body;
    const { id } = req.params;
    
    try {       
        // Obtêm a pasta de templates
        const templateDir = path.join(process.cwd(), 'src', 'modules', 'templates', 'saved');
        const file = path.join(templateDir, `${id}.json`);
        
        // Obtêm json
        const template = JSON.parse(await fs.readFile(file, 'utf8'));

        // Substitui packets
        template.packets = packet;

        // Escreve arquivo
        await fs.writeFile(file, JSON.stringify(template, null, 4));
        
        return { data: { template }, message: 'Template editado com sucesso' };
    } catch (err) {
        console.error('Erro saving template: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
