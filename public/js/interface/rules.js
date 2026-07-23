import showToast from '../utils/toast-notifications.js';
import { selectedTemplate, selectedGroup, templatesMap, templateContentMap, fetchAuxiliar } from './template.js';
import { groupsMap } from './groups.js';
import { updateInputs } from './home.js';
import FetchService from '../utils/fetchService.js';

//* ======================{ Variáveis Globais }======================

const api = new FetchService();

const newRuleBtn = document.getElementById('new-rule-button');
export const ruleList = document.getElementById('rule-list');
const saveNewRuleBtn = document.getElementById('save-new-rule-button');
const toggleAllRules = document.getElementById('toggle-all-rules');

//* ======================{ Controle da página }======================

// Adiciona nova regra
newRuleBtn.addEventListener('click', () => {
    createRule({ scroll: true });
});

// ADiciona botão de clique para salvar regra
saveNewRuleBtn.addEventListener('click', async(e) => {
    const ruleListChildren = ruleList.children;
    
    // Obtêm regras
    const rules = [...ruleListChildren].map(validateFields);
    
    // Caso existam regras inválidas retorna
    if (rules.some(rule => rule === null)) {
        showToast({ message: 'Existem regras com campos obrigatórios não preenchidos' });
        return;
    }
    
    // Faz requisição para salvar regra
    const { success, data } = await fetchAuxiliar({ url: `/api/rules/${selectedTemplate}/template`, method: "POST", body: { rules } });
    if(!success) return;
    
    templateContentMap.get(selectedTemplate).rules = data.ruleList;

    // Atualiza os indicadores visuais
    [...ruleListChildren].forEach(ruleElement => { 
        updateStatusDot({ el: ruleElement });
    });
})

toggleAllRules.addEventListener('change', () => {
    const enabled = toggleAllRules.checked;

    ruleList.querySelectorAll('.toggle-response')
        .forEach(toggle => {
            toggle.checked = enabled;
        });
});

//* Funções:

// Função responsável por criar uma nova regra
export function createRule({ rule = null, scroll = false } = {}) {
    // Cria elemento
    const div = document.createElement('div');
    if (rule?.id) div.dataset.id = rule.id;
    div.dataset.type = rule?.action?.type ?? 'template';
    div.dataset.expanded = !rule ? true : false;
    div.className = 'card p-4 group';
    
    // Obtêm HTML
    div.innerHTML = getRuleHTML({ rule });
    
    // Renderiza os pacotes
    const packetList = div.querySelector('.byte-packets-list')
    renderPackets({ container: packetList, selected: rule ? rule.action.packets : [] });

    // Gerencia eventos
    setupEvents({ el: div, container: packetList });

    // Adiciona ao DOM
    ruleList.append(div);
    
    // Faz scroll até a nova regra
    if (scroll) {
        requestAnimationFrame(() => {
            div.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        });
    }
}

// Função responsável por dar scroll
function scrollToSelectedPacket({ container }) {
    const selected = container.querySelector('input:checked');
    if (!selected) return;

    const item = selected.closest('label');

    requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        const scrollPosition = 
            itemRect.top - containerRect.top + container.scrollTop
            - (container.clientHeight / 2)
            + (item.clientHeight / 2);

        container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    });
}

// Função responsável por montar o html
function getRuleHTML({ rule = null } = {}) {
    return `
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-5">
                <svg class="group-data-[expanded=true]:rotate-270 show-rule rotate-180 w-3 h-3 cursor-pointer" xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 24 32">
                    <path stroke="#6366F1" stroke-width="2" d="M14.44,0,16,1.56,3.12,14.4,16,27.24,14.44,28.8,0,14.4Z"/>
                </svg>
                <span class="status-dot size-3 rounded-full ${rule?.enabled ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.9)]' : !rule ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.9)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]'}"></span>
                <input class="input name-input font-bold w-[18rem]" value="${rule?.name ?? 'Nova regra'}">
            </div>

            <div class="flex gap-5">
                <div class="flex items-center gap-2">
                    <p class="text-[0.7em]">Resposta automática:</p>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" ${rule?.enabled ? 'checked' : !rule ? 'checked' : ''} class="toggle-response sr-only peer">

                        <div class="w-12 h-6 rounded-full bg-surface-3 peer-checked:bg-primary transition-colors"></div>
                        <div class="absolute left-1 top-1 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-6"></div>
                    </label>
                </div>


                <button class="delete-button cursor-pointer size-[2rem]">
                    <img src="/img/icons/trash.svg" class="size-full hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(239,68,68,.7)] opacity-40 transition-all duration-200">
                </button>
            </div>
        </div>

        <div class="rule-content grid group-data-[expanded=true]:grid-rows-[1fr] grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
            <div class="overflow-hidden">
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
                        
                        <input class="input condition-value" placeholder="Ex.: 06" value="${formatConditionValue(rule?.condition?.value)}">
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
                        <div class="hidden flex-col group-data-[type=packets]:flex">
                            <span class="font-bold text-text-secondary">
                                Pacotes
                            </span>
                            <div class="byte-packets-list flex flex-col max-h-[10rem] p-2 text-[0.8em] rounded-xl gap-2 border border-border bg-linear-to-b from-background to-surface-2 shadow-[0_6px_16px_rgba(0,0,0,.35)] overflow-y-auto">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

// Função responsável por renderizar os pacotes da lista
function renderPackets({ container, selected = [] }) {
    // Limpa lista
    container.innerHTML = '';
    
    // Obtêm as regras
    const template = templateContentMap.get(selectedTemplate);
    if (!template) return;
    
    // Itera nos pacotes
    template.packets.forEach(packet => {
        const checked = selected ? selected.some(s => s.id === packet.id) : null;

        container.insertAdjacentHTML('beforeend', `
            <label class="flex items-center gap-3 cursor-pointer">
                <input
                    value="${packet.id}"
                    data-order="${packet.order}"
                    type="checkbox"
                    class="checkbox"
                    ${checked ? 'checked' : ''}
                >
                <span>${packet.name}</span>
            </label>
        `);
    });

    scrollToSelectedPacket({ container });
}

// Função responsável por controlar o evento de select
function setupEvents({ el, container }) {
    // Evento de seleção
    const select = el.querySelector('.send-mode');
    select.addEventListener('change', () => { 
        // Altera dataset para estilo
        el.dataset.type = select.value
        
        const selected = [...container.querySelectorAll('input:checked')].map(input => input.value);

        renderPackets({ container, selected });
    });

    // Evento para deletar regra
    const iconBtn = el.querySelector('.delete-button');
    iconBtn.addEventListener('click', async() => {
        if(!confirm('Tem certeza que deseja excluir essa regra?')) return;
        
        // Caso seja uma regra já carregada deleta
        if(el?.dataset?.id) {
            const { success } = await fetchAuxiliar({ url: `/api/rules/${el.dataset.id}`, method: 'DELETE' });
            if(!success) return;

            const content = templateContentMap.get(selectedTemplate);
            content.rules = content.rules.filter(rule => rule.id !== el.dataset.id);
        }

        el.remove();
    });
    
    // Evento para inputs
    const conditionField = el.querySelector('.condition-field');
    const conditionValueInp = el.querySelector('.condition-value');

    // Função responsável por atualizar input
    function updateConditionInput() {
        conditionValueInp.value = formaVal(conditionValueInp.value);
        conditionValueInp.oninput = () => { conditionValueInp.value = formaVal(conditionValueInp.value) };
    }

    // Função responsável por formatar input
    function formaVal(value) {
        // Remove espaços
        value = value.replace(/\s/g, '').toUpperCase();

        if (conditionField.value === 'sequence') return value.replace(/(.{2})/g, '$1 ').trim();

        // Byte único: apenas FF
        return value.slice(0, 2);
    }

    conditionField.addEventListener('change', updateConditionInput);
    updateConditionInput();

    // Evento de esconder/mostrar regra
    const showRule = el.querySelector('.show-rule');
    showRule.addEventListener('click', function() {
        const willClose = el.dataset.expanded === 'true';

        el.dataset.expanded = !willClose;

        // Se abriu a regra
        if (!willClose) {
            setTimeout(() => {
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
        }
    });
}

//* ======================{ Funções auxiliares }======================

// Função responsável por extrair conteúdos para salvar
function getRuleData(ruleElement) {
    const type = ruleElement.querySelector('.send-mode').value;

    return {
        // Obtêm id
        id: ruleElement.dataset.id ?? null,

        // Obtêm nome
        name: ruleElement.querySelector('.name-input').value,
        enabled: ruleElement.querySelector('.toggle-response').checked,

        // Obtêm condições
        condition: {
            field: ruleElement.querySelector('.condition-field').value,
            operator: ruleElement.querySelector('.condition-operator').value,
            value: parseConditionValue(ruleElement)
        },

        // Obtêm ações
        action: {
            type,
            packets: type === 'packets' ? [...ruleElement.querySelectorAll('.byte-packets-list input:checked')]
                    .map(input => ({
                        id: input.value,
                        order: Number(input.dataset.order)
                    }))
                : null,
        }
    };
}

// Função responsável por validar campos e retornar os certos
function validateFields(ruleElement) {
    // Obtêm os objetos
    const rule = getRuleData(ruleElement);
    
    // Verificações
    if(rule.name === '') return null;
    if(rule.condition.field === '' || rule.condition.operator  === '' || rule.condition.value == null || Number.isNaN(rule.condition.value)) return null;
    if(rule.action.type === '') return null;

    if (rule.condition.field === 'sequence') {
        if (rule.condition.value.some(Number.isNaN)) return null;
    }
    else { 
        if (Number.isNaN(rule.condition.value)) return null;
    }

    return rule;
}

// Função responsável por formata input
function formatSequence(value) {
    return value.replace(/\s/g, '').replace(/(.{2})/g, '$1 ').trim().toUpperCase();
}

// Função responsável por verificar se é sequência
function parseConditionValue(ruleElement) {
    const field = ruleElement.querySelector('.condition-field').value;
    const input = ruleElement.querySelector('.condition-value').value.trim();

    if (field === "sequence") return input.split(/\s+/).map(byte => parseInt(byte, 16));

    return parseInt(input, 16);
}

// Função responsável por formatar valor recebido
export function formatConditionValue(value) {
    if (Array.isArray(value)) return value.map(byte => byte.toString(16).toUpperCase().padStart(2, "0")).join(" ");

    return value?.toString(16).toUpperCase().padStart(2, "0") ?? '';
}

// Função responsável por atualizar as bolinhas
function updateStatusDot({ el }) {
    const enabled = el.querySelector('.toggle-response').checked;
    const dot = el.querySelector('.status-dot');

    dot.classList.toggle('bg-success', enabled);
    dot.classList.toggle('bg-danger', !enabled);

    dot.classList.toggle('shadow-[0_0_10px_rgba(34,197,94,0.9)]', enabled);
    dot.classList.toggle('shadow-[0_0_8px_rgba(239,68,68,0.8)]', !enabled);
}

// Função responsável por recarregar os pacotes das ferramentas
export function refreshRulePackets() {
    [...ruleList.children].forEach(ruleEl => {
        const container = ruleEl.querySelector('.byte-packets-list');

        const ruleId = ruleEl.dataset.id;
        const rule = templateContentMap.get(selectedTemplate)?.rules?.find(r => r.id === ruleId);

        renderPackets({ container, selected: rule?.action?.packets ?? [] });
    });
}