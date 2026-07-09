import { createServer } from 'http';
import { log } from './src/modules/shared/utils/logger.js';
import { setSystemConfig } from './src/config/system.js';
import 'dotenv/config';
import { Server } from 'socket.io';
import app from './app.js';
import initSockets from './src/sockets/index.js';

const server = createServer(app);
const io = new Server(server);
initSockets(io);

// Sempre que reinicia o servidor força estado falso
setSystemConfig({ serial: { connected: false } });

// Inicia a aplicação
server.listen(process.env.PORT, '0.0.0.0' , () => {
    log.success(`Server started: localhost:${process.env.PORT}`);
});