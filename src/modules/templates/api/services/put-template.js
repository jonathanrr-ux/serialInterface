import fs from 'fs/promises';
import path from 'path';

export default async function putTemplate(req) {
    // Obtêm as informações a salvar
    let { name, description, newGroupId } = req.body;
    const { id, groupId } = req.params;
    
    try {       
        // Obtêm o grupo atual
        const oldGroupPath = path.join(process.cwd(), "data", `${groupId}.json`);
        const oldGroup = JSON.parse(await fs.readFile(oldGroupPath, "utf8"));
        
        // Procura o template
        const templateIndex = oldGroup.templates.findIndex(t => t.id === id);
        const template = oldGroup.templates[templateIndex];

        // Atualiza campos
        if (name !== undefined) template.name = name;
        if (description !== undefined) template.description = description;

        // Continua no mesmo grupo
        if (!newGroupId || newGroupId === groupId) {
            // Atualiza template
            oldGroup.templates[templateIndex] = template;

            // Escreve no arquivo
            await fs.writeFile(oldGroupPath, JSON.stringify(oldGroup, null, 4), "utf8");

            // Retorna
            return { data: { template }, message: "Template editado com sucesso"};
        }

        // Obtêm caminho do novo grupo
        const newGroupPath = path.join(process.cwd(), "data", `${newGroupId}.json`);

        // Lê novo grupo
        const newGroup = JSON.parse(await fs.readFile(newGroupPath, "utf8"));

        // Remove do grupo antigo
        oldGroup.templates.splice(templateIndex, 1);

        // Adiciona no novo grupo
        newGroup.templates.push(template);

        // Salva ambos
        await Promise.all([
            fs.writeFile(oldGroupPath, JSON.stringify(oldGroup, null, 4), "utf8"),
            fs.writeFile(newGroupPath, JSON.stringify(newGroup, null, 4), "utf8")
        ]);

        return { data: { template }, message: "Template movido com sucesso" };
    } catch (err) {
        console.error('Erro saving template: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
