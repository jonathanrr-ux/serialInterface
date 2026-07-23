export const LOG_TYPES = {
    ERROR: 'error',
    CONNECTION_STARTED: 'connection-started',
    CONNECTION_CLOSED: 'connection-closed',
    AUTO_SEND_STARTED: 'auto-send-started',
    AUTO_SEND_STOPPED: 'auto-send-stopped',
    AUTO_SEND_ERROR: 'auto-send-error',
    TX: 'tx',
    RX: 'rx'
};

export const LOGS_DEFINITIONS = {
    [LOG_TYPES.ERROR]: {
        label: 'Erro',
        color: 'text-red-500'
    },

    [LOG_TYPES.CONNECTION_STARTED]: {
        label: 'Conexão',
        color: 'text-blue-400',
        msg: 'Conexão iniciada'
    },

    [LOG_TYPES.CONNECTION_CLOSED]: {
        label: 'Conexão',
        color: 'text-blue-400',
        msg: 'Conexão fechada'
    },

    [LOG_TYPES.AUTO_SEND_STARTED]: {
        label: 'Auto envio',
        color: 'text-violet-400'
    },

    [LOG_TYPES.AUTO_SEND_STOPPED]: {
        label: 'Auto envio',
        color: 'text-violet-400'
    },

    [LOG_TYPES.AUTO_SEND_ERROR]: {
        label: 'Auto envio',
        color: 'text-red-400'
    },

    [LOG_TYPES.TX]: {
        label: 'Enviado',
        color: 'text-cyan-400'
    },

    [LOG_TYPES.RX]: {
        label: 'Recebido',
        color: 'text-emerald-400'
    }
};