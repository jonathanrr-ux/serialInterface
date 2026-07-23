import { Op } from 'sequelize';
import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function postAutoSend(req) {
    // Obtêm as regras
    const { autoSends } = req.body;
    const { id: templateId } = req.params;
    
    const transaction = await db.sequelize.transaction();
    
    try {
        // IDs das regras que já existem
        const existingIds = autoSends.filter(a => a.id).map(s => s.id);

        // Remove as que não vieram da interface
        await db.AutoSend.destroy({
            where: {
                template_id: templateId,
                ...(existingIds.length && { id: { [Op.notIn]: existingIds } })
            },
            transaction
        });

        await Promise.all(
            autoSends.map(a => {
                const values = {
                    name: a.name,
                    enabled: a.enabled,
                    interval: a.interval,
                    type: a.type,
                    start_on_connect: a.start_on_connect,
                    packet_id: a.packet_id,
                    template_id: templateId
                };

                if (!a.id) return db.AutoSend.create(values, { transaction });

                return db.AutoSend.update(values, { where: { id: a.id }, transaction });
            })
        );

        // Busca estado final
        const autoSendList = await db.AutoSend.findAll({ 
            where: { template_id: templateId },
            transaction
        });
        
        await transaction.commit();

        return { message: 'Auto envios salvos com sucesso', data: { autoSendList } };
    } catch (err) {
        console.error('Erro updating rules: ', err)

        await transaction.rollback();

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}