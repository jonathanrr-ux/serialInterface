const { default: services } = await import('./services/index.js');

export async function postTemplateRule(req, res, next) {
    try {
        const data = await services.postTemplateRule(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function deleteRule(req, res, next) {
    try {
        const data = await services.deleteRule(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}