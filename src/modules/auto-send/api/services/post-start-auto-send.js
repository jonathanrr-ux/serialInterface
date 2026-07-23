import db from '../../../../db/models/index.js';
import CustomError from '../../../shared/utils/custom-error.js';
import autoSendService from '../../../shared/utils/auto-send/service.js';
import { getSerialConnection } from '../../../serial/core/connection.js';
import { LOG_TYPES } from '../../../../../public/js/utils/logs-definitions.js';
import { createLog } from '../../../shared/utils/serial-logger.js';

export default async function postStartAutoSend(req) {
    // Obtêm id dos parâmetros
    const { id } = req.params;
    const { port } = getSerialConnection();

    // Verifica se a porta está aberta
    if(!port?.isOpen) {
        createLog({ type: LOG_TYPES.ERROR, msg: 'Erro ao enviar os dados: Porta fechada' });
        throw new CustomError();
    }

    try {
        // Obtêm do banco de dados
        const autoSend = await db.AutoSend.findOne({
            where: { id },
            include: [
                {
                    model: db.Packet,
                    as: 'packet'
                },
                {
                    model: db.Template,
                    as: 'template',
                    include: [
                        {
                            model: db.Packet,
                            as: 'packets'
                        }
                    ]
                }
            ]
        });
        if (!autoSend) throw new CustomError(404, 'Auto envio não encontrado.');
        
        // Inicia o serviço
        const result = autoSendService.start(autoSend);

        // Emite status que iniciou
        autoSendService.emitStatus();

        // Caso de algum erro para iniciar
        if(!result.success) {
            // Cria log
            createLog({ type: LOG_TYPES.AUTO_SEND_ERROR, msg: result.message });

            throw new CustomError(400, result.message);
        }
    
        // Atualiza banco de dados
        await db.AutoSend.update({ enabled: true }, { where: { id } });
    
        // Cria log
        createLog({ type: LOG_TYPES.AUTO_SEND_STARTED, msg: result.message });

        return {};
    }catch(err) {
        console.error('Erro updating rules: ', err)

        if (err instanceof CustomError) throw err;
        else throw new CustomError();
    }
}