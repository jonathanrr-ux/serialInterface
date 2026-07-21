import { createServer } from 'http';
import { setSystemConfig } from './src/config/system.js';
import 'dotenv/config';
import setupDatabase from './src/db/index.js';
import { Server } from 'socket.io';
import app from './app.js';
import initSockets from './src/sockets/index.js';

const server = createServer(app);
const io = new Server(server);
initSockets(io);

// Inicia banco de dados
await setupDatabase();

// Sempre que reinicia o servidor força estado falso
setSystemConfig({ serial: { connected: false } });

// Inicia a aplicação
server.listen(process.env.PORT, '0.0.0.0' , () => {
    console.log(`Server started: localhost:${process.env.PORT}`);
});