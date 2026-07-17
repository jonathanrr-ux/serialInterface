const { default: services } = await import('./services/index.js');

export async function getGroups(req, res, next) {
    try {
        const data = await services.getGroups(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function postGroup(req, res, next) {
    try {
        const data = await services.postGroup(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function putGroup(req, res, next) {
    try {
        const data = await services.putGroup(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}

export async function deleteGroup(req, res, next) {
    try {
        const data = await services.deleteGroup(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}