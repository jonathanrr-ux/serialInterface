import fs from 'fs/promises';
import path from 'path';

export async function getTemplates() {
    const templateDir = path.join(process.cwd(), 'data');

    const files = await fs.readdir(templateDir);

    const groups = await Promise.all(
        files
            .filter(file => file.endsWith('.json'))
            .map(async file => {
                const content = await fs.readFile(
                    path.join(templateDir, file),
                    'utf-8'
                );

                return JSON.parse(content);
            })
    );

    // Junta todos os templates de todos os grupos
    return groups.flatMap(group => group.templates ?? []);
}