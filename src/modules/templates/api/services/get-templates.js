import { getTemplates } from '../../../shared/utils/templates.js';

export default async function getTemplate(req) {
    try {       
        const templates = await getTemplates();

        return { data: { templates } };
    } catch (err) {
        console.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
