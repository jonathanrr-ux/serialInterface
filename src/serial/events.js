const clients = new Set();

export function addClient(res) {
    clients.add(res);

    res.on('close', () => {
        clients.delete(res);
    });
}

// Manda evento
export function sendEvent(data) {
    for (const client of clients) {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
}