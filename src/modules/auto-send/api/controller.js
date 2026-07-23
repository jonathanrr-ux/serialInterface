const { default: services } = await import('./services/index.js');

export async function postAutoSend(req, res, next) {
    try {
        const data = await services.postAutoSend(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function deleteAutoSend(req, res, next) {
    try {
        const data = await services.deleteAutoSend(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function postStartAutoSend(req, res, next) {
    try {
        const data = await services.postStartAutoSend(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function postStopAutoSend(req, res, next) {
    try {
        const data = await services.postStopAutoSend(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}