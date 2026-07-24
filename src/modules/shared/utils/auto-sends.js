import db from "../../../db/models/index.js";

// Obtêm todos auto send
export async function getAutoSends() {
    return await db.AutoSend.findAll({
        where: { start_on_connect: true },
        include: [
            {
                model: db.Packet,
                as: 'packet'
            },
            {
                model: db.Template,
                as: 'template',
                include: [
                    {
                        model: db.Packet,
                        as: 'packets'
                    }
                ]
            }
        ]
    });
}

// Obtêm o auto send atualizado
export async function getUpdatedAutoSend(id) {
    return await db.AutoSend.findOne({
        where: { id },
        include: [
            {
                model: db.Packet,
                as: 'packet'
            },
            {
                model: db.Template,
                as: 'template',
                include: [
                    {
                        model: db.Packet,
                        as: 'packets'
                    }
                ]
            }
        ]
    });
}