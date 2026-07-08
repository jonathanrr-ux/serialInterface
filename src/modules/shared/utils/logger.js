import winston from 'winston';
import 'winston-daily-rotate-file'
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Definindo cores
const colors = {
    error: 'red',
    warn: 'yellow',
    success: 'green',
    info: 'white',
    highlight: 'cyan',
};

// Níveis customizados
const levels = {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    highlight: 4,
};

winston.addColors(colors);

// Transporte diário com rotação
const dailyRotateTransport = new winston.transports.DailyRotateFile({
    dirname: logDir,
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxFiles: '15d',
    level: 'highlight'
});

// Logger principal
const logger = winston.createLogger({
    levels,
    level: 'highlight',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        // Console com cores
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true })
            )
        }),
        dailyRotateTransport
    ]
});

export const log = {
    error: (msg, data) => { 
        if (data instanceof Error) {
            return logger.error(`${msg} ${formatError(data)}`);
        }
        return logger.error(data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg);
    },
    warn: (msg, data) => logger.warn(data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg),
    success: (msg, data) => logger.success(data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg),
    info: (msg, data) => logger.info(data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg),
    highlight: (msg, data) => logger.highlight(data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg),
};

const formatError = (err) => {
    return `${err.name}: ${err.message}\n${err.stack}`;
};