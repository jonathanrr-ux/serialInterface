import showToast from '../utils/toast-notifications.js';
import { templatesMap } from './template.js';
import { updateInputs } from './home.js';
import FetchService from '../utils/fetchService.js';

//* ======================{ Variáveis Globais }======================

const api = new FetchService();

const newRuleBtn = document.getElementById('new-rule-button');
const ruleList = document.getElementById('rule-list');
const saveNewRuleBtn = document.getElementById('save-new-rule-button');

//* ======================{ Controle da página }======================

// Adiciona nova regra
newRuleBtn.addEventListener('click', () => {
    createRule();
});

// ADiciona botão de clique para salvar regra
saveNewRuleBtn.addEventListener('click', async() => {
    // Obtêm regras 
    const total = ruleList.children.length;
    const rules = [...ruleList.children].map(validateFields).filter(Boolean);

    // Existem regras na tela, mas nenhuma válida
    if (total > 0 && rules.length === 0) {
        showToast({ message: 'Campos inválidos' });
        return;
    }

    // Faz requisição para salvar regra
    const { message, success, data } = await updateRules({ url: '/api/rules', method: "POST", body: { rules } });
    showToast({ type: success ? 'success' : 'error', message });
    if(!success) return;
})

//* Funções:

// Função responsável por criar uma nova regra
function createRule({ rule = null } = {}) {
    // Cria  elemento
    const div = document.createElement('div');
    if (rule?.id) div.dataset.id = rule.id;
    div.dataset.type = rule?.action?.type ?? 'template';
    div.className = 'card p-4 group';

    // Obtêm HTML
    div.innerHTML = getRuleHTML({ rule });
    
    updateInputs({ input: div.querySelector('.condition-value') });

    // Cria selects de templates e adiciona evento
    setupTemplateSelect({ ruleElement: div, rule });
    setupEvents(div);

    // Adiciona ao DOM
    ruleList.append(div);
}

// Função responsável por montar o html
function getRuleHTML({ rule = null } = {}) {
    return `
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="size-3 rounded-full bg-success"></span>
                <input class="input font-bold w-[18rem]" value="${rule?.name ?? 'Nova regra'}">
            </div>

            <div class="flex gap-2">
                <button class="icon-button danger cursor-pointer">
                    <img src="/img/icons/trash.svg">
                </button>
            </div>
        </div>

        <hr class="my-4 text-border">

        <div class="grid grid-cols-[1fr_auto_1fr] gap-6">
            <div class="flex flex-col gap-2">
                <span class="font-bold text-text-secondary">Quando</span>
                <select class="input condition-field">
                    <option value="last" ${rule?.condition?.field === 'last' ? 'selected' : ''}>Último byte</option>
                    <option value="first" ${rule?.condition?.field === 'first' ? 'selected' : ''}>Primeiro byte</option>
                    <option value="byte" ${rule?.condition?.field === 'byte' ? 'selected' : ''}>Byte</option>
                    <option value="sequence" ${rule?.condition?.field === 'sequence' ? 'selected' : ''}>Sequência</option>
                </select>
                <select class="input condition-operator">
                    <option value="equal" ${rule?.condition?.operator === 'equal' ? 'selected' : ''}>for igual a</option>
                    <option value="different" ${rule?.condition?.operator === 'different' ? 'selected' : ''}>for diferente de</option>
                </select>
                
                <input class="input condition-value" placeholder="Ex.: 06" value="${rule?.condition?.value ?? ''}">
            </div>
            <div class="flex items-center text-4xl font-bold">
                →
            </div>
            <div class="flex flex-col gap-2">
                <span class="font-bold text-text-secondary">
                    Então
                </span>
                <select class="input send-mode">
                    <option value="template" ${rule?.action?.type === 'template' ? 'selected' : ''}>Enviar template completo</option>
                    <option value="packets" ${rule?.action?.type === 'packets' ? 'selected' : ''}>Enviar pacotes específicos</option>
                </select>
                <select class="templates-select input">
                    <option value="" disabled ${!rule ? 'selected' : ''}></option>
                </select>
                <div class="hidden flex-col group-data-[type=packets]:flex">
                    <span class="font-bold text-text-secondary">
                        Pacotes
                    </span>
                    <div class="byte-packets-list flex flex-col max-h-[10rem] p-2 text-[0.8em] rounded-xl gap-2 border border-border bg-linear-to-b from-background to-surface-2 shadow-[0_6px_16px_rgba(0,0,0,.35)] overflow-y-auto">
                    </div>
                </div>
            </div>
        </div>`;
}

// Função responsável por criar select de templates e adicionar eventos
function setupTemplateSelect({ ruleElement, rule = null }) {
    // Obtêm os elementos
    const select = ruleElement.querySelector('.templates-select');
    const packetsList = ruleElement.querySelector('.byte-packets-list');
    
    // Cria as opções do select
    templatesMap.forEach(template => {
        select.add(new Option(template.name, template.id));
    });

    select.addEventListener('change', () => {
        renderPackets({ container: packetsList, template: templatesMap.get(select.value) });
    });

    if (rule) {
        select.value = rule.action.templateId;
        renderPackets({ container: packetsList, template: templatesMap.get(rule.action.templateId), selected: rule.action.packets });
    }
}

// Função responsável por renderizar os pacotes da lista
function renderPackets({ container, template, selected = [] }) {
    // Limpa lista
    container.innerHTML = '';
    if (!template) return;

    // Itera nos pacotes
    template.packets.forEach(packet => {
        const checked = selected?.includes(packet.id);

        container.insertAdjacentHTML('beforeend', `
            <label class="flex items-center gap-3 cursor-pointer">
                <input
                    value="${packet.id}"
                    type="checkbox"
                    class="checkbox"
                    ${checked ? 'checked' : ''}
                >
                <span>${packet.name}</span>
            </label>
        `);
    });
}

// Função responsável por controlar o evento de select
function setupEvents(rule) {
    // Obtêm select
    const select = rule.querySelector('.send-mode');
    const iconBtn = rule.querySelector('.icon-button');

    // Muda estilo
    select.addEventListener('change', () => {
        rule.dataset.type = select.value;
    });

    // Deleta regra
    iconBtn.addEventListener('click', async() => {
        if(!confirm('Tem certeza que deseja excluir essa regra?')) return;

        rule.remove();

        // Caso seja uma regra já carrega deleta
        if(rule?.dataset?.id) {
            const { message, success } = await updateRules({ url: `/api/rules/${rule.dataset.id}`, method: 'DELETE' });
            showToast({ type: success ? 'success' : 'error', message });
            if(!success) return;
        }
    });
}

//* ======================{ Funções auxiliares }======================

// Função responsável por obter as regras
async function getRules() {
    // Faz requisição para obter todas regras
    const { message, success, data } = await updateRules({ url: '/api/rules' });
    if(!success) {
        showToast({ message });
        return;
    }
    
    data.rules.forEach(r => createRule({ rule: r }));
}

// Função responsável por fazer fetch
async function updateRules({ url, method, body }) {
    return api.request(url, { method, body });
}

// Função responsável por extrair conteúdos para salvar
function getRuleData(ruleElement) {
    const type = ruleElement.querySelector('.send-mode').value;

    return {
        // Obtêm id
        id: ruleElement.dataset.id ?? null,

        // Obtêm nome
        name: ruleElement.querySelector('input').value,

        // Obtêm condições
        condition: {
            field: ruleElement.querySelector('.condition-field').value,
            operator: ruleElement.querySelector('.condition-operator').value,
            value: ruleElement.querySelector('.condition-value').value
        },

        // Obtêm ações
        action: {
            type,
            templateId: ruleElement.querySelector('.templates-select').value,
            packets: type === 'packets' ?  [...ruleElement.querySelectorAll('.byte-packets-list input:checked')].map(input => input.value) : null
        }
    };
}

// Função responsável por validar campos e retornar os certos
function validateFields(ruleElement) {
    // Obtêm os objetos
    const rule = getRuleData(ruleElement);
    
    if(rule.name === '') return null;
    if(rule.condition.field === '' || rule.condition.operator  === '' || rule.condition.value  === '') return null;
    if(rule.action.type === '' || rule.action.templateId  === '') return null;

    return rule;
}

// Função responsável por recarregar as regras
export function refreshRulesTemplate({ templates }) {
    // Obtêm select dos templates
    document.querySelectorAll('.templates-select').forEach(async (select) => {
        // Caso sejam limpos os templates, limpa as regras
        if(!templates.length) {
            ruleList.innerHTML = '';

            // Faz requisição para excluir todos templates
            const { message, success, data } = await updateRules({ url: '/api/rules', method: "DELETE" });
            if(!success) {
                showToast({ message });
                return;
            }

            return;
        }

        // Obtêm selecionado
        const selected = select.value;
        
        // Limpa lista
        select.innerHTML = '';

        // Recria todas opções com o Map
        templates.forEach(template => {
            select.add(new Option(template.name, template.id));
        });

        // Tenta restaurar a seleção
        if (templates.has(selected)) select.value = selected;
        else {
            // Template foi removido
            const container = select.closest('.card').querySelector('.byte-packets-list');

            container.innerHTML = '';
        }
    });
}

//* ======================{ Inicialização da página }======================

export async function initRules() {
    await getRules();
}