const { default: services } = await import('./services/index.js');

export async function postRule(req, res, next) {
    try {
        const data = await services.postRule(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function getRules(req, res, next) {
    try {
        const data = await services.getRules(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function deleteRules(req, res, next) {
    try {
        const data = await services.deleteRules(req);
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