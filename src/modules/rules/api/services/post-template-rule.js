import { Op } from 'sequelize';
import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function postRule(req) {
    // Obtêm as regras
    const { rules } = req.body;
    const { id: templateId } = req.params;
    
    const transaction = await db.sequelize.transaction();
    
    try {
        // IDs das regras que já existem
        const existingIds = rules.filter(rule => rule.id).map(rule => rule.id);

        // Remove as que não vieram da interface
        await db.Rule.destroy({
            where: {
                template_id: templateId,
                ...(existingIds.length && { id: { [Op.notIn]: existingIds } })
            },
            transaction
        });

        await Promise.all(
            rules.map(rule => {
                const values = {
                    name: rule.name,
                    condition: rule.condition,
                    action: rule.action,
                    enabled: rule.enabled,
                    template_id: templateId
                };

                if (!rule.id) return db.Rule.create(values, { transaction });

                return db.Rule.update(values, { where: { id: rule.id }, transaction });
            })
        );

        // Busca estado final
        const ruleList = await db.Rule.findAll({ 
            where: { template_id: templateId },
            transaction
        });
        
        await transaction.commit();

        return { message: 'Regras salvas com sucesso', data: { ruleList } };
    } catch (err) {
        console.error('Erro updating rules: ', err)

        await transaction.rollback();

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
