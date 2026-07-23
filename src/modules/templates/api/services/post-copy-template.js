import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function postCopyTemplate(req) {
    // Obtêm o nome e pacote a salvar
    const { id } = req.params;
    const { groupId } = req.body;
    
    const transaction = await db.sequelize.transaction();
    
    try {
        // Busca template original com relacionamentos
        const template = await db.Template.findByPk(id, {
            include: [
                {
                    model: db.Packet,
                    as: 'packets'
                },
                {
                    model: db.Rule,
                    as: 'rules'
                }
            ],
            transaction
        });
        if (!template) throw new CustomError(404, 'Template não encontrado');

        // Cria novo template
        const newTemplate = await db.Template.create(
            { name: `${template.name} (Cópia)`, description: template.description, group_id: groupId ?? template.group_id }, 
            { transaction }
        );

        // Copia pacotes
        if (template.packets.length) {
            await db.Packet.bulkCreate(
                template.packets.map(packet => ({
                    name: packet.name,
                    bytes: packet.bytes,
                    template_id: newTemplate.id
                })),
                { transaction }
            );
        }

        // Copia regras
        if (template.rules.length) {
            await db.Rule.bulkCreate(
                template.rules.map(rule => ({
                    name: rule.name,
                    condition: rule.condition,
                    action: rule.action,
                    template_id: newTemplate.id
                })),
                { transaction }
            );
        }

        await transaction.commit();

        return { data: { template: newTemplate }, message: 'Template copiado com sucesso' };
    } catch (err) {
        console.error('Erro copying template: ', err);

        await transaction.rollback();

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
