import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function postTemplate(req) {
    // Obtêm o nome e pacote a salvar
    const { name, description, groupId } = req.body;
    
    try {       
        // Cria template
        const template = await db.Template.create({ name, description, group_id: groupId });

        return { data: { template }, message: 'Template adicionado com sucesso' };
    } catch (err) {
        console.error('Erro saving template: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
