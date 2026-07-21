import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function deleteTemplate(req) {
    // Obtêm template a ser excluido
    const { id } = req.params;

    try {
        await db.Template.destroy({ where: { id } });

        return { message: 'Template deletado com sucesso' };
    } catch (err) {
        console.error('Erro deleting template: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
