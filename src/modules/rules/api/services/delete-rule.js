import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function deleteRule(req) {
    // Obtêm o id
    const { id } = req.params;

    try {       
        // Exclui regra
        await db.Rule.destroy({ where: { id } });

        return { message: 'Regra deletada com sucesso' };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
