const { default: services } = await import('./services/index.js');
import { addClient } from '../../../serial/events.js';

export async function postSendBytes(req, res, next) {
    try {
        const data = await services.postSendBytes(req);
        res.status(200).json(data);
    } catch(err) {
        next(err);
    } 
}



export function getSerialEvents(req, res, next) {
    try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        addClient(res);

    } catch(err) {
        next(err);
    }
}