const { default: services } = await import('./services/index.js');

export async function getSerial(req, res, next) {
    try {
        const data = await services.getSerial(req, res);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}