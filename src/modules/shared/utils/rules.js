import db from '../../../db/models/index.js';
import CustomError from '../utils/custom-error.js';

export async function getRules() {
    const rulesList = await db.Rule.findAll({
        attributes: ['id', 'template_id', 'name', 'condition', 'action', 'enabled'],
        include: [{
            model: db.Template,
            as: 'template',
            attributes: ['id'],
            include: [{
                model: db.Packet,
                as: 'packets',
                attributes: ['id', 'bytes', 'order']
            }]
        }]
    });

    return rulesList.map(rule => rule.toJSON());
}