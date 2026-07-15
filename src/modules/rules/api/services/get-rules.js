import CustomError from '../../../shared/utils/custom-error.js';
import { getRules } from '../../../shared/utils/rules.js';

export default async function getTemplates(req) {
    try {       
        const rules = await getRules();

        return { data: { rules } };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
