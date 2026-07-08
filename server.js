import { createServer } from 'http';
import { log } from './src/modules/shared/utils/logger.js';
import 'dotenv/config';
import app from './app.js';

const server = createServer(app);

// Inicia a aplicação
server.listen(process.env.PORT, '0.0.0.0' , () => {
    log.success(`Server started: localhost:${process.env.PORT}`);
});