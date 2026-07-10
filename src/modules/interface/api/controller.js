const { default: services } = await import('./services/index.js');

export async function getLogs(req, res, next) {
    try {
        const data = await services.getLogs(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function deleteLogs(req, res, next) {
    try {
        const data = await services.deleteLogs(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}
