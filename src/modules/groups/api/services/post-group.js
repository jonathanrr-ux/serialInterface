import CustomError from '../../../shared/utils/custom-error.js';
import db from '../../../../db/models/index.js';

export default async function postGroup(req) {
    // Obtêm as regras
    const { icon, color, name, description } = req.body;
    
    try {       
        // Cria grupo
        const group = await db.Group.create({ icon, color, name, description });

        // Retorna
        return { message: 'Grupo salvo com sucesso', data : { group } };
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
