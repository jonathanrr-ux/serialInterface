import CustomError from '../../../shared/utils/custom-error.js';
import db from '../../../../db/models/index.js';

export default async function putGroup(req) {
    // Obtêm as regras
    const { icon, color, name, description } = req.body;
    const { id } = req.params;
    
    try {       
        // Busca o grupo pelo id informado
        const currentGroup = await db.Group.findOne({ where: { id }});
        if (!currentGroup) throw new CustomError(404, 'Grupo não encontrado');

        // Atualiza grupo
        await currentGroup.update({
            icon,
            color,
            name,
            description
        });

        // Retorna
        return { message: 'Grupo editado com sucesso', data: { group: currentGroup } };
    } catch (err) {
        console.error('Erro updating group: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
