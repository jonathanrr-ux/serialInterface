const { default: services } = await import('./services/index.js');

export async function postSendBytes(req, res, next) {
    try {
        const data = await services.postSendBytes(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function postSaveTemplate(req, res, next) {
    try {
        const data = await services.postSaveTemplate(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function postEditTemplate(req, res, next) {
    try {
        const data = await services.postEditTemplate(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function getTemplates(req, res, next) {
    try {
        const data = await services.getTemplates(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}