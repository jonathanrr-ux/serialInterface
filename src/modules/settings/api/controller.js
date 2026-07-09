const { default: services } = await import('./services/index.js');

export async function postConfig(req, res, next) {
    try {
        const data = await services.postConfig(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}