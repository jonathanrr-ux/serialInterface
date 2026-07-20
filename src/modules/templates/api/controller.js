const { default: services } = await import('./services/index.js');

export async function postTemplate(req, res, next) {
    try {
        const data = await services.postTemplate(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function deleteTemplate(req, res, next) {
    try {
        const data = await services.deleteTemplate(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function deleteAllTemplates(req, res, next) {
    try {
        const data = await services.deleteAllTemplates(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function putTemplatePackets(req, res, next) {
    try {
        const data = await services.putTemplatePackets(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function putTemplate(req, res, next) {
    try {
        const data = await services.putTemplate(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}