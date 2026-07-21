import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';

export default async function putTemplatePackets(req) {
    // Obtêm o nome e pacote a salvar
    let { packets } = req.body;
    const { id: templateId } = req.params;
    
    const transaction = await db.sequelize.transaction();

    try {
        // Verifica se o template existe
        const template = await db.Template.findByPk(templateId, { transaction });
        if (!template) throw new CustomError(404, "Template não encontrado");

        // Pacotes existentes
        const currentPackets = await db.Packet.findAll({ where: { template_id: templateId },transaction });

        // Obtêm os ids existentes e os que vieram
        const currentIds = currentPackets.map(p => p.id);
        const receivedIds = packets.filter(p => p.id).map(p => p.id);

        // Remove os que não vieram mais
        await db.Packet.destroy({
            where: { id: currentIds.filter(id => !receivedIds.includes(id)) },
            transaction
        });

        for(const packet of packets) {
            // Caso exista ID atualiza
            if(packet.id) await db.Packet.update({ name: packet.name, bytes: packet.bytes }, { where: { id: packet.id }, transaction });
            else await db.Packet.create({ template_id: templateId, name: packet.name, bytes: packet.bytes }, { transaction });
        }

        await transaction.commit();
        
        // Retorna lista atualizada
        const updatedPackets = await db.Packet.findAll({ where: { template_id: templateId }});

        return { data: { packets: updatedPackets }, message: 'Pacotes atualizados com sucesso' };
    } catch (err) {
        console.error('Erro saving packets: ', err)
        await transaction.rollback();

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
