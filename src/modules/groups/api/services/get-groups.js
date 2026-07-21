import CustomError from '../../../shared/utils/custom-error.js';
import db from '../../../../db/models/index.js';

export default async function getGroups(req) {
    try {      
        const groupList = await db.Group.findAll({
            attributes: ['id', 'name', 'description', 'icon', 'color'],
            order: [['created_at', 'ASC']]
        })
        
        return { data: { groupList } };
    } catch (err) {
        console.error('Erro getting groups: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
