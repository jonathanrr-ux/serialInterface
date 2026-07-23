import CustomError from '../../../shared/utils/custom-error.js';
import db from '../../../../db/models/index.js';

export default async function getTemplateContent(req) {
    // Obtêm o id
    const { id } = req.params;

    try {
        // Obtêm os pacotes
        const packets = await db.Packet.findAll({
            attributes: ['id', 'template_id', 'name', 'bytes', 'order'],
            where: { template_id: id },
            order: [['order', 'ASC']]
        });
        
        // Obtêm as regras
        const rules = await db.Rule.findAll({
            attributes: ['id', 'template_id', 'name', 'condition', 'action', 'enabled'],
            where: { template_id: id }
        });

        // Obtêm as regras
        const autoSends = await db.AutoSend.findAll({
            attributes: ['id', 'template_id', 'packet_id', 'name', 'type', 'interval', 'enabled', 'start_on_connect'],
            where: { template_id: id }
        });
        
        return { data: { packets, rules, autoSends } };
    } catch (err) {
        console.error('Erro template content: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
