import FetchService from '../js/utils/fetchService.js';

//* ======================{ Variáveis Globais }======================

const api = new FetchService();

//* ======================{ Controle da página }======================

getSerialPort();

// Função responsável por buscar conexão serial
async function getSerialPort() {
    console.log('oi')
    const { message, success } = await api.request('/api/serial');
    if(!success) return;
}

