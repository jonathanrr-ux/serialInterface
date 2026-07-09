import { getSystemConfig } from "../../../config/system.js";

/**
 * Middleware que injeta variáveis padrão no contexto do template (res.locals),
 * permitindo que Handlebars/EJS/etc. possam acessar informações do usuário,
 * tema, idioma e função de tradução.
 * 
 * @param {import('express').Request} req - Objeto da requisição Express.
 * @param {import('express').Response} res - Objeto da resposta Express.
 * @param {import('express').NextFunction} next - Função para passar para o próximo middleware.
 */
export default function setLocals(req, res, next) {
    // Obtêm configurações do sistema
    const system = getSystemConfig();

    res.locals.system = system

    next();
};