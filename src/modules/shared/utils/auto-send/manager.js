import { send } from '../../../serial/core/sender.js';
import CustomError from '../custom-error.js';
import EventEmitter from 'events';
import { getUpdatedAutoSend } from '../auto-sends.js';

export default class AutoSendManager extends EventEmitter {
    // Cria jobs
    #jobs = new Map();

    // Função responsável por iniciar
    start(autoSend) {
        // Caso já esteja iniciado
        if (this.#jobs.has(autoSend.id)) return { success: false, message: `${autoSend.name}: Auto envio já esta em execução` };

        const job = { active: true, timeout: null, nextRun: Date.now() + autoSend.interval, name: autoSend.name };

        // Função para começar
        const run = async () => {
            // Verifica se está ativo
            if (!job.active) return;

            // Executa
            try {
                await this.#execute(autoSend);
            } catch (err) {
                console.error(`Erro executando auto envio ${autoSend.id}:`, err);

                // Parar o job em caso de erro
                this.stop(autoSend.id);
                return { success: false, message: `${autoSend.name}: Erro durante o auto envio` };
            }

            // Verifica se está ativo
            if (!job.active) return;
            
            // Calcula próximo envio
            job.nextRun = Date.now() + autoSend.interval;

            this.emit('updated', {
                id: autoSend.id,
                name: autoSend.name,
                nextRun: job.nextRun
            });

            // Agenda próximo envio
            job.timeout = setTimeout(run, autoSend.interval);
        };

        // Adiciona job
        this.#jobs.set(autoSend.id, job);

        // Primeira execução imediata
        setTimeout(run, 0);

        return { success: true, message: `${autoSend.name}: Auto envio iniciado` };
    }

    // Função responsável por parar
    stop(id) {
        // Obtêm o job
        const job = this.#jobs.get(id);
        if (!job) return { success: false, message: 'Nenhum auto envio encontrado' };

        // Desativa
        job.active = false;

        // Limpa timeout
        if (job.timeout) clearTimeout(job.timeout);

        // Tira do Map
        this.#jobs.delete(id);

        return { success: true };
    }

    // Função para parar todos jobs
    stopAll() {
        for (const [id] of this.#jobs) this.stop(id);

        return { success: true, message: `Todos auto envios foram encerrados` };
    }

    // Função responsável por verificar se está rodando
    isRunning(id) {
        return this.#jobs.has(id);
    }

    // Retorna status dos jobs ativos
    getStatus() {
        return [...this.#jobs.entries()]
            .map(([id, job]) => ({
                id,
                name: job.name,
                nextRun: job.nextRun,
                active: job.active
            }));
    }

    // Função responsável por emitir status
    emitStatus() {
        this.emit('status', {
            active: this.#jobs.size,
            jobs: this.getStatus()
        });
    }

    // Função responsável por mandar os bytes
    async #execute(autoSend) {
        // Obtêm o auto send atualizado
        const updatedAutoSend = await getUpdatedAutoSend(autoSend.id);
        if (!updatedAutoSend) return { success: false, message: 'Auto envio não encontrado' };
        
        // Caso for para mandar pacotes
        if (updatedAutoSend.type === 'packet') {
            await send({ bytes: updatedAutoSend.packet.bytes });
            return;
        }

        // Caso for para mandar um template
        for (const packet of updatedAutoSend.template.packets) await send({ bytes: packet.bytes });
    }
}