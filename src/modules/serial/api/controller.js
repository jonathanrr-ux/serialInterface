const { default: services } = await import('./services/index.js');

export async function getPorts(req, res, next) {
    try {
        const data = await services.getPorts(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function postConnect(req, res, next) {
    try {
        const data = await services.postConnect(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function postDisconnect(req, res, next) {
    try {
        const data = await services.postDisconnect(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}