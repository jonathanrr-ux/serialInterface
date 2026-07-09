/**
 * Classe de erro customizado para padronizar erros da aplicação.
 *
 * Permite:
 * - Definir o código HTTP do erro
 * - Definir uma mensagem de erro (normalmente uma chave i18n)
 * - Transportar erros específicos por campo (ex: validações de formulário)
 *
 * É utilizada em conjunto com o middleware global de tratamento de erros
 * para gerar respostas consistentes para o front-end.
 *
 * Exemplo de uso:
 * ```js
 * throw new CustomError(
 *   400,
 *   'validation.error',
 *   { password: 'validation.user.password_only_numbers' }
 * );
 * ```
 *
 * @class CustomError
 * @extends Error
 */
export default class CustomError extends Error {

    /**
     * Cria uma nova instância de erro customizado.
     *
     * @param {number} [status=500] - Código HTTP do erro (ex: 400, 401, 404, 500).
     * @param {string} [message='server.internal'] - Mensagem do erro ou chave i18n.
     * @param {Object<string, string>|null} [fields=null] - Objeto contendo erros por campo,
     * onde a chave representa o nome do campo e o valor representa a mensagem ou chave i18n.
     */
    constructor(status = 500, message = 'internal_server', fields = null, messageOptions = null) {
        super(message);
        this.status = status;
        this.fields = fields;
        this.messageOptions = messageOptions;
    }
}