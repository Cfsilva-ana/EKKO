# 🌱 EKKO - Agricultura Gamificada

Sistema integrado que combina **simulação 3D** desenvolvida na Unity com **plataforma web** para ensinar agricultura sustentável através de gamificação, análise inteligente de solo e **chatbot IA com Llama 3.2**.

## 🏆 Status do Projeto

- ✅ **Backend** - API + IA + Chatbot completos
- ✅ **Frontend** - Dashboard + Chat integrados  
- ✅ **Chatbot IA** - Llama 3.2 com RAG
- ✅ **MongoDB** - Integração completa
- 🔧 **Simulação Unity** - Em desenvolvimento
- 🏆 **44ª Projete ETE FMC** - Feira tecnológica
- 🏆 **Prêmio melhor projeto de desinvolvimento de sistema pelo inatel** 
## 🚀 Início Rápido

### Windows
```cmd
ollama pull llama3.2
ollama serve
cd Backend
copy .env.example .env
pip install -r requirements_unity.txt
python main.py
```

### Linux/macOS
```bash
ollama pull llama3.2
ollama serve &
cd Backend
cp .env.example .env
pip3 install -r requirements_unity.txt
python3 main.py
```

### Scripts Automáticos
- **Windows**: `start.bat`
- **Linux/macOS**: `./start.sh`

**Acesso**: http://localhost:8002 | **Docs**: http://localhost:8002/docs

📖 **Guia Completo**: Veja [`INSTALL.md`](INSTALL.md) para instruções detalhadas

## 📁 Estrutura

```
ProjEkko/
├── Backend/                    # 🚀 API + IA
│   ├── main.py                 # FastAPI (11 endpoints)
│   ├── ai_analyzer.py          # Sistema IA (9 parâmetros)
│   ├── ai_connector.py         # Ollama Llama 3.2
│   ├── prompts.py              # Prompts chatbot
│   ├── database.py             # MongoDB Atlas
│   ├── test_mongo.py           # Diagnóstico MongoDB
│   ├── .env                    # Credenciais
│   └── BACKEND_COMPLETO.md     # Documentação completa
├── Frontend/                   # 🎨 Interface Web
│   ├── pages/
│   │   └── dashboard.html      # Dashboard (8 seções)
│   ├── css/
│   │   ├── unity-dashboard.css # Estilos dashboard
│   │   └── chat_bot.css        # Estilos chatbot
│   ├── js/
│   │   ├── unity-dashboard.js  # Lógica dashboard
│   │   └── chat_bot.js         # Chatbot streaming
│   └── README.md               # Documentação frontend
└── Obsoleto/                   # 📦 Versões antigas
```

## 🎯 Funcionalidades Principais

1. **Análise de Solo IA** - 9 parâmetros com recomendações personalizadas
2. **Chatbot Agrícola** - Llama 3.2 com contexto do usuário e RAG
3. **Dashboard Interativo** - 8 seções com visualizações em tempo real
4. **Dicas Personalizadas** - Popup com melhorias de solo por IA
5. **Monitoramento Real-Time** - Dados atualizados automaticamente
6. **Sessões Isoladas** - Chat individual por Unity ID
7. **Geolocalização** - Integração com dados climáticos INMET
8. **Design Moderno** - Interface responsiva com glassmorphism

## ✅ Componentes do Sistema

### 🚀 **Backend (11 Endpoints)**
- **API FastAPI** com MongoDB Atlas (2 collections)
- **IA Avançada** - Análise de 9 parâmetros de solo
- **Chatbot Llama 3.2** - Streaming, RAG, contexto MongoDB
- **Autenticação** por Unity ID
- **Previsões** de colheita e sustentabilidade
- **Recomendações** personalizadas de solo
- **Monitoramento** em tempo real

### 🎨 **Frontend (8 Seções)**
- **Dashboard Moderno** com glassmorphism
- **Chatbot Integrado** - Sidebar, sessões, streaming
- **Visualizações** interativas (mapas de calor, gráficos)
- **Popup Dicas** - Melhorias de solo por IA
- **Design Responsivo** (desktop, tablet, mobile)
- **UX Otimizada** (loading, error handling, validação)

### 🤖 **Chatbot IA (Llama 3.2)**
- **Streaming** de respostas em tempo real
- **RAG** - Contexto de MongoDB (perfil, solo, NPK)
- **Sessões** isoladas por Unity ID
- **Geolocalização** para dados climáticos INMET
- **Títulos** automáticos de conversas
- **Respostas** sobre agricultura, mercado, clima

### 🧠 **IA - 9 Parâmetros Analisados**
pH • Umidade • Temperatura • Salinidade • Condutividade • NPK • Performance

## 📊 API Endpoints (11 Total)

**Base URL**: `http://localhost:8002`

### Unity Integration
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/unity/status` | Status da API e banco |
| GET | `/unity/login/{user_id}` | Login por ID do usuário |
| GET | `/unity/dashboard/{user_id}` | Dados completos dashboard |
| POST | `/unity/soil/save/{user_id}` | Salvar dados da simulação |
| GET | `/unity/analise-ia/{user_id}` | Análise IA (9 parâmetros) |
| GET | `/unity/monitoring/{user_id}` | Monitoramento tempo real |
| GET | `/unity/recreate-test-data` | Recriar dados teste |

### Chatbot IA
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/chat/{unity_id}` | Chat streaming com contexto |
| POST | `/api/generate_title` | Gerar título da conversa |
| GET | `/api/soil-tips/{unity_id}` | Dicas de melhoria de solo |
| GET | `/api/health` | Health check Ollama |

## 🛠️ Stack Tecnológica

- **Backend**: Python 3.11, FastAPI, MongoDB Atlas
- **Frontend**: HTML5, CSS3, JavaScript ES6, Chart.js
- **IA**: Llama 3.2 (Ollama), Análise agronômica
- **Database**: MongoDB Atlas (2 collections)
- **Design**: Glassmorphism, Responsivo
- **Streaming**: Server-Sent Events (SSE)

## 📈 Métricas do Projeto

- **5.000+** linhas de código
- **25+** arquivos desenvolvidos
- **11** endpoints API REST
- **8** seções no dashboard
- **9** parâmetros de análise IA
- **2** collections MongoDB
- **100%** responsivo (desktop, tablet, mobile)

## 🔧 Configuração e Testes

### Requisitos
- Python 3.11+
- Ollama com Llama 3.2
- MongoDB Atlas (conta gratuita)
- Navegador moderno

### Variáveis de Ambiente (.env)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGO_DB_NAME=EKKOnUnity
API_PORT=8002
OLLAMA_BASE_URL=http://localhost:11434
```

### Testes
```bash
# Testar MongoDB
python Backend/test_mongo.py

# Testar API
curl http://localhost:8002/unity/status

# Testar Ollama
curl http://localhost:11434/api/tags
```

## 📚 Documentação

### Documentação Principal
- **Instalação Completa**: [`INSTALL.md`](INSTALL.md) - Guia multiplataforma
- **Backend Completo**: [`md/BACKEND_COMPLETO.md`](md/BACKEND_COMPLETO.md) - Arquitetura e API
- **Frontend**: [`Frontend/README.md`](Frontend/README.md) - Interface e componentes
- **API Docs**: http://localhost:8002/docs - Swagger interativo

### Documentação Técnica (pasta `md/`)
- **Chat por Usuário**: [`md/CHAT_POR_USUARIO.md`](md/CHAT_POR_USUARIO.md) - Isolamento de sessões
- **Setup Chat**: [`md/CHAT_SETUP.md`](md/CHAT_SETUP.md) - Configuração Llama 3.2
- **Melhorias Chat**: [`md/MELHORIAS_CHAT.md`](md/MELHORIAS_CHAT.md) - Otimizações implementadas
- **Solução Chat**: [`md/SOLUCAO_CHAT.md`](md/SOLUCAO_CHAT.md) - Troubleshooting
- **Testes Chat**: [`md/TESTE_CHAT.md`](md/TESTE_CHAT.md) - Casos de teste
- **Isolamento**: [`md/TESTE_ISOLAMENTO.md`](md/TESTE_ISOLAMENTO.md) - Testes de sessão

### Estrutura de Documentação
```
ProjEkko/
├── README.md                    # 📖 Documentação principal
├── INSTALL.md                   # 🚀 Guia de instalação
├── md/                          # 📚 Documentação técnica
│   ├── BACKEND_COMPLETO.md      # Backend detalhado
│   ├── CHAT_POR_USUARIO.md      # Sistema de chat
│   ├── CHAT_SETUP.md            # Configuração Ollama
│   ├── MELHORIAS_CHAT.md        # Otimizações
│   ├── SOLUCAO_CHAT.md          # Troubleshooting
│   ├── TESTE_CHAT.md            # Testes
│   └── TESTE_ISOLAMENTO.md      # Isolamento de sessões
├── Backend/
│   └── README.md                # Backend overview
└── Frontend/
    └── README.md                # Frontend overview
```

---

**EKKO** - Agricultura Gamificada 🌱🎮  
**Equipe 34DS08** | **ETE FMC** | **Santa Rita do Sapucaí, MG**
