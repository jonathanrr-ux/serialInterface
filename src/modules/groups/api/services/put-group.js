import CustomError from '../../../shared/utils/custom-error.js'
import path from 'path';
import fs from 'fs/promises';

export default async function postGroup(req) {
    // Obtêm as regras
    const { icon, color, name, description } = req.body;
    const { id } = req.params;
    
    try {       
        // Obtêm a pasta de rules
        const dataDir = path.join(process.cwd(), 'data');
        const groupPath = path.join(dataDir, `${id}.json`);

        let existingGroup;
        try {
            const raw = await fs.readFile(groupPath, 'utf-8');
            existingGroup = JSON.parse(raw);
        } catch (err) {
            if (err.code === 'ENOENT') throw new CustomError(404, 'Grupo não encontrado');
            throw err;
        }

        // Atualiza somente os campos editáveis
        const updatedGroup = {
            ...existingGroup,
            icon: icon ?? existingGroup.icon,
            color: color ?? existingGroup.color,
            name: name.trim(),
            description: description?.trim() || null,
        };

        // Escreve no arquivo
        await fs.writeFile(groupPath, JSON.stringify(updatedGroup, null, 4));

        return { message: 'Grupo editado com sucesso', data: { group: updatedGroup } };
    } catch (err) {
        console.error('Erro getting serial ports: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}
