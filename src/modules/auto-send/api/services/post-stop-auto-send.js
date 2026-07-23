import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';
import autoSendService from '../../../shared/utils/auto-send/service.js';
import { LOG_TYPES } from '../../../../../public/js/utils/logs-definitions.js';
import { createLog } from '../../../shared/utils/serial-logger.js';

export default async function postStartAutoSend(req) {
    // Obtêm id dos parâmetros
    const { id } = req.params;

    try {
        // Obtêm do banco de dados
        const autoSend = await db.AutoSend.findOne({
            where: { id }
        });
        if (!autoSend) throw new CustomError(404, 'Auto envio não encontrado.');
        
        // Obtêm o resultado
        const result = autoSendService.stop(autoSend.id);

        // Emite status
        autoSendService.emitStatus();
        
        if(!result.success) {
            createLog({ type: LOG_TYPES.ERROR, msg: result.message });
            throw new CustomError(400, result.message);
        }
    
        await db.AutoSend.update({ enabled: false }, { where: { id } });

        // Cria log
        createLog({ type: LOG_TYPES.AUTO_SEND_STOPPED, msg: `${autoSend.name}: Auto envio encerrado` });
    
        return {};
    }catch(err) {
        console.error('Erro updating rules: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}