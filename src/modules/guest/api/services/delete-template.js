import { log } from '../../../shared/utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

export default async function getTemplates(req) {
    const { id } = req.params;

    try {       
        // Obtêm a pasta de templates
        const templateDir = path.join(process.cwd(), 'src', 'templates');

        // Lê diretório
        const filePath = path.join(templateDir, `${id}.json`);

        await fs.unlink(filePath);

        return {};
    } catch (err) {
        log.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
