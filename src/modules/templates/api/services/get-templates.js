import CustomError from '../../../shared/utils/custom-error.js';
import db from '../../../../db/models/index.js';

export default async function getTemplate(req) {
    try {       
        const templateList = await db.Template.findAll({
            attributes: ['id', 'name', 'description', 'group_id']
        })
        
        return { data: { templateList } };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
