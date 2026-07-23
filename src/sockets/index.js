import initAutoSendEvents from './events/auto-send.js';
let ioInstance;

export function getIO() {
    return ioInstance;
}

export default function initSockets(io) {
    ioInstance = io;

    io.on('connection', (socket) => {
    });

    initAutoSendEvents();
}