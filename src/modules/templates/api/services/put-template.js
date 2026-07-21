import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function putTemplate(req) {
    // Obtêm as informações a salvar
    let { name, description, groupId } = req.body;
    const { id } = req.params;

    try {       
        const updateData = {};

        // Verifica parâmetros passados
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (groupId !== undefined) updateData.group_id = groupId;

        // Atualiza
        await db.Template.update(updateData, { where: { id } });

        // Obtêm retorno
        const template = await db.Template.findByPk(id);

        return { data: { template }, message: "Template editado com sucesso" };
    } catch (err) {
        console.error('Erro saving template: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
