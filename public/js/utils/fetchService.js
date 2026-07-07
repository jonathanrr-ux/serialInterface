/**
 * Serviço genérico para fazer requisições HTTP usando fetch.
 * Inclui suporte a CSRF token, headers padrão e retorno padronizado.
 */
export default class FetchService {
    /**
     * Cria uma instância do FetchService.
     * @param {string} [baseURL=''] - URL base para todas as requisições.
     * @param {Object} [defaultHeaders={}] - Headers padrão enviados em todas as requisições.
     */
    constructor(baseURL = '', defaultHeader = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = defaultHeader;
    }

    /**
     * Faz uma requisição HTTP genérica utilizando fetch.
     *
     * @param {string} url - Caminho relativo ou absoluto da requisição.
     * @param {Object} [options={}] - Opções da requisição.
     * @param {string} [options.method='GET'] - Método HTTP (GET, POST, PUT, DELETE, etc).
     * @param {Object|null} [options.body=null] - Corpo da requisição (para POST, PUT, PATCH).
     * @param {Object} [options.headers={}] - Headers adicionais que sobrescrevem os headers padrão.
     * @param {number} [options.timeout=15000] - Tempo limite da requisição em milissegundos.
     *
     * @returns {Promise<{
     *   success: boolean,
     *   status: number|string,
     *   data?: Object,
     *   message: string,
     *   fields?: Object,
     *   ui: Object
     * }>} 
     * Retorna um objeto padronizado contendo:
     * - success: indica se a requisição foi bem-sucedida.
     * - status: código HTTP retornado pelo backend (ou '408' em caso de timeout).
     * - data: dados retornados pelo backend (quando sucesso).
     * - message: mensagem de sucesso ou erro.
     * - fields: erros de validação por campo (quando aplicável).
     * - ui: informações adicionais para a interface.
     *
     * @throws {Error} Pode relançar erros inesperados não tratados explicitamente.
     */
    async request(url, { method = 'GET', body = null, headers = {}, timeout = 20000 } = {}){

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...this.defaultHeaders,
                ...headers
            },
            credentials: 'include',
        }
        
        if (timeout) options.signal = AbortSignal.timeout(timeout);
        if (body) options.body = JSON.stringify(body);

        try {
            const res = await fetch(`${this.baseURL}${url}`, options);
            const data = await res.json();
    
            if (data?.error) {
                return {
                    success: false,
                    status: res.status,
                    data: data?.error?.data || {},
                    message: data?.error?.message || 'Unknown error',
                    fields: data?.error?.fields || undefined,
                    ui: data?.error?.ui || {}
                }
            }
    
            return {
                success: true,
                status: res.status,
                data: data?.data || {},
                message: data?.message || '',
                ui: data?.ui || {}
            };
        } catch (err) {
            console.error(err)

            // Timeout do fetch excedido
            if (err.name === 'TimeoutError') {
                return {
                    success: false,
                    status: '408',
                    message: 'Request timeout, try again',
                    fields: undefined,
                    ui: {}
                }
            }
        }
    }
}