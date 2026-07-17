import path from 'path';
import fs from 'fs/promises';

export default async function getGroups(req) {
    try {       
        // Obtêm a pasta de grupos
        const dataDir = path.join(process.cwd(), 'data');

        // Lê diretório
        const files = await fs.readdir(dataDir);

        // Carrega todos os grupos
        const groups = await Promise.all(
            // Lê conteúdo dos arquivos
            files.map(async file => {
                const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
    
                // Retorna em json
                return JSON.parse(content);
            })
        );

        return { data: { groups } };
    } catch (err) {
        console.error('Erro getting groups: ', err)

        if (err instanceof Error) throw err;
        else throw new Error();
    }
}
