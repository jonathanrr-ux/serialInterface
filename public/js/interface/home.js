import FetchService from '../utils/fetchService.js';
import showToast from '../utils/toast-notifications.js';

//* ======================{ Variáveis globais }======================

const serialConnectionBtn = document.getElementById('serial-connection-button');

const api = new FetchService();

//* ======================{ Controle da página }======================

// Adiciona evento de clique ao botão de conectar ou desconectar serial
serialConnectionBtn.addEventListener('click', async function() {
    // Caso clique e não esteja conectado, conecta
    if(this.dataset.connected === 'false') {
        // Inicia comunicação serial
        startSerialConnection();

        // Altera dataset
        this.dataset.connected = true;
        return;
    }

    stopSerialConnection();
    this.dataset.connected = false;
});

//* ======================{ Funções auxiliares }======================

// Função responsável por iniciar a conexão serial
async function startSerialConnection() {
    const { message, success } = await api.request('/api/serial/connect', { method: 'POST' });
    if(!success) {
        showToast({ message });
        return;
    }
}

// Função responsável por parar a conexão serial
async function stopSerialConnection() {
    const { message, success } = await api.request('/api/serial/disconnect', { method: 'POST' });
    if(!success) {
        showToast({ message });
        return;
    }
}

//* ======================{ Inicialização da página }======================
