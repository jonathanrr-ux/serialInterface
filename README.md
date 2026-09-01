# ⚡ Serial Interface

Interface web para comunicação com dispositivos seriais de forma simples e intuitiva.

Desenvolvida utilizando **HTML**, **JavaScript**, **Tailwind CSS** e **Node.js**, a aplicação permite conectar-se a dispositivos através de portas seriais, enviar comandos e visualizar as respostas em tempo real.

---

## 📸 Preview

<img src="./docs/preview.png" width="900">

---

## ✨ Funcionalidades

- 🔌 Conexão com dispositivos via Serial
- 📤 Envio manual de comandos
- 🤖 Envio automático de comandos
- 📥 Monitoramento de dados recebidos em tempo real
- ⚡ Automação baseada em respostas recebidas
- 🔄 Regras condicionais para respostas seriais
- ⚙️ Configuração dos parâmetros da conexão serial
- 📝 Histórico de comandos e mensagens
- 📊 Visualização dos dados enviados e recebidos
- 🎨 Design moderno com Tailwind CSS

---

## 🛠 Tecnologias

### Frontend

- HTML5
- JavaScript (ES6+)
- Tailwind CSS

### Backend

- Node.js
- Express
- SerialPort

---

## 📁 Estrutura

```
serialInterface
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── assets/
│   ├── js/
│   ├── css/
│   └── index.html
│
└── README.md
```

---

## 🚀 Instalação

Clone o projeto

```bash
git clone https://github.com/jonathanrr-ux/serialInterface.git
```

Entre na pasta

```bash
cd serialInterface
```

```bash

npm install

npm start
```

ou

```bash
npm run dev:server
```

## 📡 Como funciona

1. Abra a interface.
2. Inicie o servidor Node.
3. Selecione a porta serial.
4. Escolha o Baud Rate.
5. Clique em **Conectar**.
6. Envie comandos.
7. Visualize as respostas em tempo real.

---

## 💻 Compatibilidade

| Navegador | Suporte |
|------------|---------|
| Chrome | ✅ |
| Edge | ✅ |
| Opera | ✅ |
| Firefox | ❌ |
| Safari | ❌ |

---

## 📦 Dependências

Backend

- express
- serialport
- cors

Frontend

- tailwindcss

---

## 📈 Próximas melhorias

- [ ] Reconexão automática
- [ ] Múltiplas conexões

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Faça um Fork
2. Crie uma branch

```bash
git checkout -b feature/minha-feature
```

3. Commit

```bash
git commit -m "Minha feature"
```

4. Push

```bash
git push origin feature/minha-feature
```

5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido por **Jonathan Zanella**.
