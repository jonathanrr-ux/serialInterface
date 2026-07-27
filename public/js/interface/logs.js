import { LOG_TYPES, LOGS_DEFINITIONS } from "../utils/logs-definitions.js";
import FetchService from '../utils/fetchService.js';

//* ======================{ Variáveis globais }======================

const socket = io();
const api = new FetchService();
const logsList = document.getElementById('logs-list');
const clearAllLogsBtn = document.getElementById('clear-all-logs-button');
const filterLogsBtn = document.getElementById('filter-logs-buttons');
const viewSelect = document.getElementById('view-select');

let currentFilter = "all";

//* ======================{ Controle dos logs }======================

//* Eventos:

viewSelect.addEventListener('change', async function() {
    await api.request('/api/settings/save', { method: 'POST', body: { mode: this.value } });

    updateLogs();
});

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
    
    const p = document.createElement('p');
    if (log.bytes) p.dataset.bytes = JSON.stringify(log.bytes);
    p.className = 'border-b border-border py-2';

    if (log.type.startsWith("connection")) p.dataset.type = "connection";
    else if (log.type.startsWith("auto-send")) p.dataset.type = "auto-send";
    else p.dataset.type = log.type;

    p.innerHTML = `
        <span class="text-text-secondary shrink-0">
            [${formatted}]
        </span>

        <span class="${definition.color} font-semibold shrink-0">
            ${definition.label}:
        </span>

        <span class="log-content break-all">
            ${log.bytes ? formatBytes(log.bytes, viewSelect.value) : log.msg}
        </span>
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

// Função responsável por formatar os bytes
function formatBytes(bytes, mode) {
    switch (mode) {
        case "hex":
            return bytes.map(b => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");

        case "decimal":
            return bytes.join(" ");

        case "ascii":
            return bytes.map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : ".").join("");
    }
}

// Função responsável por atualizar os logs
function updateLogs() {
    logsList.querySelectorAll("p").forEach(log => {
        if (!log.dataset.bytes) return;

        const bytes = JSON.parse(log.dataset.bytes);

        // Formata os bytes
        log.querySelector(".log-content").textContent = formatBytes(bytes, viewSelect.value);
    });
}

//* ======================{ Controle dos filtros }======================

// Função responsável por criar os filtros disponíveis
function createFilters() {
    // Limpa lista
    filterLogsBtn.innerHTML = '';

    const filters = new Set(["all"]);

    for(const [key, value] of Object.entries(LOGS_DEFINITIONS)) {
        if (key.startsWith("connection")) filters.add("connection");
        else if (key.startsWith("auto-send")) filters.add("auto-send");
        else filters.add(key);
    }

    filters.forEach(filter => {
        const button = document.createElement("button");
        button.dataset.filter = filter;
        button.textContent = getFilterLabel(filter);

        filterLogsBtn.appendChild(button);


        button.addEventListener('click', function() {
            // Obtêm o tipo do botão clicado
            const filter = this.dataset.filter;

            currentFilter = filter;
            applyFilter();

            // Itera sobre os logs
            logsList.querySelectorAll('p').forEach(log => {
                if (filter === 'all' || log.dataset.type === filter) log.classList.remove('hidden');
                else log.classList.add('hidden');
            });
        });
    });
}

// Função responsável por obter o label do filtro
function getFilterLabel(filter) {
    switch (filter) {
        case "all":
            return "Todos";
        case "connection":
            return "Conexão";
        case "auto-send":
            return "Auto envio";
        default:
            return LOGS_DEFINITIONS[filter].label;
    }
}

// Função responsável por aplicar o filtro
function applyFilter() {
    logsList.querySelectorAll("p").forEach(log => {
        const show = currentFilter === "all" || log.dataset.type === currentFilter;

        log.classList.toggle("hidden", !show);
    });
}

//* ======================{ Inicialização da página }======================

document.addEventListener('DOMContentLoaded', () => {
    getLogs();
    createFilters();
})

//* ======================{ Socket }======================

// Escuta envio
socket.on('serial:status', (data) => {
    // Cria logs
    const p = createLog({ log: data });
    logsList.appendChild(p);

    // Aplica filtro
    if (currentFilter !== "all" && p.dataset.type !== currentFilter) p.classList.add("hidden");

    scrollLogsToBottom();
});
