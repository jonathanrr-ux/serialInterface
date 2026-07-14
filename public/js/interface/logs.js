import { LOGS_DEFINITIONS } from "../utils/logs-definitions.js";
import FetchService from '../utils/fetchService.js';

//* ======================{ Variáveis globais }======================

const socket = io();
const api = new FetchService();
const logsList = document.getElementById('logs-list');
const clearAllLogsBtn = document.getElementById('clear-all-logs-button');
const filterLogsBtn = document.querySelectorAll('#filter-logs-buttons button');

//* ======================{ Controle dos logs }======================

//* Eventos:
filterLogsBtn.forEach(f => {
    f.addEventListener('click', function() {
        // Obtêm o tipo do botão clicado
        const filter = f.dataset.filter;

        // Itera sobre os logs
        logsList.querySelectorAll('p').forEach(log => {
            if (filter === 'all' || log.dataset.type === filter) log.classList.remove('hidden');
            else log.classList.add('hidden');
        });
    });
})

// Adiciona evento de clique ao botão de limpar todos logs
clearAllLogsBtn.addEventListener('click', async() => {
    const { success, data } = await api.request('/api/interface/logs', { method: 'DELETE' });
    if(!success) return;
    
    // Limpa lista
    logsList.innerHTML = '';
});

//* Funções:

// Função responsável por criar os logs
function createLog({ log }) {
    // Formata data 
    const formatted = new Date(log.date).toLocaleString('pt-BR');

    const definition = LOGS_DEFINITIONS[log.type];
    
    // Obtêm conteúdo do texto
    const content = log.bytes ? log.bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ') : log.msg;
    
    const p = document.createElement('p');
    p.className = `border-b-2 border-border py-2`;
    p.dataset.type = (log.type === 'connection-started') || (log.type === 'connection-closed') ? 'connection' : log.type;
    p.innerHTML = `
        <span class="${definition.color}">
            [${formatted}] ${definition.label}:
        </span>
        ${content}
    `;

    return p;
}

// Função responsável por obter os logs
async function getLogs() {
    const { success, data } = await api.request('/api/interface/logs');
    if(!success) return;
    
    // Limpa lista
    logsList.innerHTML = '';
    
    // Adiciona logs
    data.logs.forEach(log => {
        logsList.appendChild(createLog({ log }));
    });

    scrollLogsToBottom();
}

function scrollLogsToBottom() {
    logsList.scrollTop = logsList.scrollHeight;
}
//* ======================{ Inicialização da página }======================

document.addEventListener('DOMContentLoaded', () => {
    getLogs();
})

//* ======================{ Socket }======================

// Escuta envio
socket.on('serial:status', (data) => {
    // Cria logs
    const p = createLog({ log: data });
    logsList.appendChild(p);

    scrollLogsToBottom();
});
