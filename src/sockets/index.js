let ioInstance;

export function getIO() {
    return ioInstance;
}

export default function initSockets(io) {
    ioInstance = io;

    io.on('connection', (socket) => {
        socket.on('disconnect', (reason) => {
            console.log('Socket desconectado:', socket.id, reason);
        });
    });
}