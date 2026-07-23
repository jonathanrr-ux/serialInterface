import db from "../../../db/models/index.js";

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