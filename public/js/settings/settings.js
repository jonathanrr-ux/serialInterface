import FetchService from "../utils/fetchService.js";
import CustomSelect from '../utils/custom-select.js';

//* ======================{ Variáveis globais }======================

const connectBtn = document.getElementById('connect-button');
const autoReconnect = document.getElementById('auto-reconnect');

const api = new FetchService();
const selectSerialPort = new CustomSelect('select-serial-port', { options: getSerialPorts });
const selectBaudRate = new CustomSelect('select-baud-rate', 
    { 
        options: [
            { value: 9600, name: '9600' },
            { value: 19200, name: '19200' },
            { value: 38400, name: '38400' },
            { value: 57600, name: '57600' },
            { value: 115200, name: '115200' },
            { value: 230400, name: '230400' },
            { value: 'other', name: 'Outro' }
        ] 
    }
);

//* ======================{ Controle da página }======================

// Adiciona evento de clique ao botão de conectar
connectBtn.addEventListener('click', async function() {
    // Verifica para retornar
    if(!selectSerialPort.value || !selectBaudRate.value) return;

    // Faz requisição para salvar as configs
    const { success } = await api.request('/api/settings/save', { method: 'POST', body: { serialPort: selectSerialPort.value, baudRate: selectBaudRate.value, autoReconnect: autoReconnect.checked } });
    if(!success) return;

    // Conecta ao serial
    const { message, success } = await api.request('/api/serial/connect', { method: 'POST' });
    if(!success) {
        showToast({ message });
        return;
    }

    window.location.href = '/home';
});

//* ======================{ Funções auxiliares }======================

// Função responsável por obter todas portas seriais e preencher o select
async function getSerialPorts() {
    const { success, data } = await api.request('/api/serial/ports');
    if(!success) return;
    
    return data.ports.map(p => ({ value: p.path, name: `${p.path} - ${p.manufacturer}` }));
}