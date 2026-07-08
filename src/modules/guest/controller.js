const { default: services } = await import('./services/index.js');
import { log } from '../shared/utils/logger.js';

// Renderiza a página padrão
export async function getIndex(req, res, next) {
    try {
        const config = await services.getSerialConnection(req);

        // Carrega página
        res.render('index', {
            js: ["guest/index"],
            ...config
        });
    } catch (err) {
        log.error('Error rendering index page: ', err);

        if (err instanceof Error) next(err);
        else next(new Error());
    }
}