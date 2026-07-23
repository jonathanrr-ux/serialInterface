import FetchService from '../utils/fetchService.js';
import showToast from '../utils/toast-notifications.js';
import CustomSelect from '../utils/custom-select.js';
import { updateFooter } from '../interface/auto-send.js';

//* ======================{ Variáveis globais }======================

const api = new FetchService();
const socket = io();

// Status
const serialStatus = document.querySelector('[data-connected]');
const serialStatusInfo = document.getElementById('serial-status-info');
const serialConnectionBtn = document.getElementById('serial-connection-button');

// Modal config
const saveConfigBtn = document.getElementById('save-config-button');
const editAutoReconnect = document.getElementById('edit-auto-reconnect');
const editSerialPort = new CustomSelect('edit-serial-port', { options: getSerialPorts });
const editBaudRate = new CustomSelect('edit-baud-rate', 
    { 
        options: [
            { value: 9600, name: '9600' },
            { value: 19200, name: '19200' },
            { value: 38400, name: '38400' },
            { value: 57600, name: '57600' },
            { value: 115200, name: '115200' },
            { value: 230400, name: '230400' }
        ],
        dropdownMaxHeight: '10rem'
    }
);

//* ======================{ Controle do botão de conexão }======================

// Adiciona evento de clique ao botão de conectar ou desconectar serial
serialConnectionBtn?.addEventListener('click', async function() {
    // Caso clique e não esteja conectado, conecta
    if(serialStatus.dataset.connected === 'false') startSerialConnection();
    else stopSerialConnection();
});

//* ======================{ Controle do modal de config }======================

// Adiciona evento de clique ao botão de conectar
saveConfigBtn?.addEventListener('click', async function() {
    // Verifica para retornar
    if(!editSerialPort.value || !editBaudRate.value) {
        showToast({ message: 'A porta serial e o baudrate devem ser preenchidos' });
        return;
    }

    // Faz requisição para salvar as configs
    const { message, success } = await api.request('/api/settings/save', { method: 'POST', body: { serialPort: editSerialPort.value, baudRate: editBaudRate.value, autoReconnect: editAutoReconnect.checked } });
    
    // Mostra notificação
    showToast({ type: success ? 'success' : 'error', message });
    if(!success) return;

    // Desconecta da conexão atual
    stopSerialConnection();
});

//* ======================{ Funções auxiliares }======================

// Função responsável por obter as configurações do usuário
async function getSettings() {
    // Faz requisição para salvar as configs
    const { message, success, data } = await api.request('/api/settings');
    if(!success) {
        showToast({ message });
        return;
    }
    
    const { settings } = data;

    // Preenche serialStatusInformações
    editSerialPort.value = settings.serialPort;
    editBaudRate.value = settings.baudRate;
    editAutoReconnect.checked = settings.autoReconnect;
}

// Função responsável por obter todas portas seriais e preencher o select
async function getSerialPorts() {
    const { message, success, data } = await api.request('/api/serial/ports');
    if(!success) {
        showToast({ message });
        return;
    }
    
    return data.ports.map(p => ({ value: p.path, name: `${p.path} - ${p.manufacturer}` }));
}

// Função responsável por iniciar a conexão serial
async function startSerialConnection() {
    const { message, success } = await api.request('/api/serial/connect', { method: 'POST' });
    if(!success) return;
}

// Função responsável por parar a conexão serial
async function stopSerialConnection() {
    const { message, success } = await api.request('/api/serial/disconnect', { method: 'POST' });
    if(!success) {
        showToast({ message });
        return;
    }
}

// Função responsável por atualizar o status
function updateSerialStatus({ connected }) {
    // Atualiza dataset
    serialStatus.dataset.connected = connected;

    // Atualiza pontinho
    serialStatusDot.className = `size-3 rounded-full ${ connected ? 'bg-success' : 'bg-danger' }`;

    // Atualiza serialStatusTextos
    serialStatusText.serialStatusTextContent = connected ? 'Conectado' : 'Desconectado';
    serialStatusInfo.serialStatusTextContent = connected ? `${port} • ${baudRate} baud` : 'Sem conexão';
    serialConnectionBtn.serialStatusTextContent = connected ? 'Desconectar' : 'Conectar';

    // Atualiza cores
    serialConnectionBtn.classList.toggle('bg-success', !connected);
    serialConnectionBtn.classList.toggle('bg-danger', connected);
}

//* ======================{ Inicialização da página }======================

document.addEventListener('DOMContentLoaded',async () => {
    await editSerialPort.ready();

    await getSettings();
})

// Escuta desconexão
socket.on('serial:close', () => {
    // Adiciona dataset
    serialStatus.dataset.connected = false;

    serialStatusInfo.textContent = '-';

    // Muda conexão
    document.querySelectorAll('#auto-send-list > .group').forEach(el => {
        el.dataset.connected = false;
    });

    // Atualiza para 0
    updateFooter({ count: 1 });
});

// Escuta conexão
socket.on('serial:open', ({ port, baudRate, autoSends }) => {
    // Adiciona dataset
    serialStatus.dataset.connected = true;
    
    // Adiciona serialStatusTexto
    serialStatusInfo.textContent = `${port} • ${baudRate} baud`;

    // Muda conexão
    autoSends.forEach(id => {
        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) el.dataset.connected = true;
    });
});