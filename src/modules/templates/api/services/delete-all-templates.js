import { log } from '../../../shared/utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

export default async function getTemplates(req) {
    try {       
        // Obtêm a pasta de templates
        const templateDir = path.join(process.cwd(), 'src', 'modules', 'templates', 'saved');

        // Lê todos os arquivos
        const files = await fs.readdir(templateDir);

        // Exclui todos
        await Promise.all(
            files.map(file =>
                fs.unlink(path.join(templateDir, file))
            )
        );

        return {};
    } catch (err) {
        log.error('Erro getting templates: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
