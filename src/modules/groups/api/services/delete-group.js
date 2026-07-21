import CustomError from '../../../shared/utils/custom-error.js';
import db from '../../../../db/models/index.js';

export default async function deleteGroup(req) {
    // Obtêm o id do grupo
    const { id } = req.params;

    try {       
        // Excluir grupo
        await db.Group.destroy({ where: { id } });

        // Retorna mensagem
        return { message: 'Grupo deletado com sucesso' };
    } catch (err) {
        console.error('Erro deleting group: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
