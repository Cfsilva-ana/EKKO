# 🚀 Guia de Instalação EKKO - Multiplataforma

Guia completo para instalação do sistema EKKO em Windows, Linux e macOS.

## 📋 Pré-requisitos

### Requisitos Mínimos
- **Python**: 3.11 ou superior
- **RAM**: 4GB (8GB recomendado)
- **Espaço**: 2GB livres
- **Internet**: Para MongoDB Atlas e Ollama

### Softwares Necessários
- Git
- Python 3.11+
- Ollama
- Navegador moderno

## 🪟 Instalação Windows

### 1. Python
```cmd
# Baixar Python 3.11+ de python.org
# Ou usar winget
winget install Python.Python.3.11
```

### 2. Git
```cmd
winget install Git.Git
```

### 3. Ollama
```cmd
# Baixar de https://ollama.ai/download/windows
# Ou usar winget
winget install Ollama.Ollama
```

### 4. Clonar Projeto
```cmd
git clone https://github.com/seu-usuario/EKKO.git
cd EKKO
```

### 5. Configurar Backend
```cmd
cd Backend
copy .env.example .env
pip install -r requirements_unity.txt
```

### 6. Configurar Ollama
```cmd
ollama pull llama3.2
ollama serve
```

### 7. Iniciar Sistema
```cmd
# Terminal 1 - Ollama
ollama serve

# Terminal 2 - Backend
cd Backend
python main.py
```

### 8. Script Automático Windows
```cmd
# Usar script pronto
start.bat
```

## 🐧 Instalação Linux (Ubuntu/Debian)

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Python e Git
```bash
sudo apt install python3.11 python3.11-pip python3.11-venv git -y
```

### 3. Ollama
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 4. Clonar Projeto
```bash
git clone https://github.com/seu-usuario/EKKO.git
cd EKKO
```

### 5. Ambiente Virtual
```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 6. Configurar Backend
```bash
cd Backend
cp .env.example .env
pip install -r requirements_unity.txt
```

### 7. Configurar Ollama
```bash
ollama pull llama3.2
ollama serve &
```

### 8. Iniciar Sistema
```bash
# Backend
cd Backend
python3 main.py
```

### 9. Script Automático Linux
```bash
chmod +x start.sh
./start.sh
```

## 🍎 Instalação macOS

### 1. Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Python e Git
```bash
brew install python@3.11 git
```

### 3. Ollama
```bash
brew install ollama
```

### 4. Clonar Projeto
```bash
git clone https://github.com/seu-usuario/EKKO.git
cd EKKO
```

### 5. Ambiente Virtual
```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 6. Configurar Backend
```bash
cd Backend
cp .env.example .env
pip install -r requirements_unity.txt
```

### 7. Configurar Ollama
```bash
ollama pull llama3.2
ollama serve &
```

### 8. Iniciar Sistema
```bash
cd Backend
python3 main.py
```

## ⚙️ Configuração Detalhada

### MongoDB Atlas
1. Criar conta em [mongodb.com](https://mongodb.com)
2. Criar cluster gratuito
3. Obter string de conexão
4. Configurar no `.env`

### Arquivo .env
```env
# MongoDB
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/
MONGO_DB_NAME=EKKOnUnity

# API
API_PORT=8002
API_HOST=0.0.0.0

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT=120
```

### Verificar Instalação
```bash
# Testar MongoDB
python Backend/test_mongo.py

# Testar API
curl http://localhost:8002/unity/status

# Testar Ollama
curl http://localhost:11434/api/tags
```

## 🔧 Scripts Automáticos

### start.bat (Windows)
```batch
@echo off
echo Iniciando EKKO...

echo Verificando Ollama...
ollama serve >nul 2>&1 &

echo Aguardando Ollama...
timeout /t 5 /nobreak >nul

echo Verificando modelo...
ollama list | findstr llama3.2 >nul
if errorlevel 1 (
    echo Baixando Llama 3.2...
    ollama pull llama3.2
)

echo Iniciando Backend...
cd Backend
python main.py

pause
```

### start.sh (Linux/macOS)
```bash
#!/bin/bash
echo "🌱 Iniciando EKKO..."

# Verificar Ollama
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama não encontrado"
    exit 1
fi

# Iniciar Ollama
echo "🤖 Iniciando Ollama..."
ollama serve &
sleep 5

# Verificar modelo
if ! ollama list | grep -q "llama3.2"; then
    echo "📥 Baixando Llama 3.2..."
    ollama pull llama3.2
fi

# Iniciar Backend
echo "🚀 Iniciando Backend..."
cd Backend
python3 main.py
```

## 🐳 Docker (Opcional)

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY Backend/ .
RUN pip install -r requirements_unity.txt

EXPOSE 8002
CMD ["python", "main.py"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  ekko-backend:
    build: .
    ports:
      - "8002:8002"
    environment:
      - MONGO_URI=${MONGO_URI}
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
  
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

### Executar com Docker
```bash
docker-compose up -d
```

## 🔍 Troubleshooting

### Problemas Comuns

#### Python não encontrado
```bash
# Windows
py -3.11 --version

# Linux/macOS
python3.11 --version
```

#### Ollama não conecta
```bash
# Verificar processo
ps aux | grep ollama  # Linux/macOS
tasklist | findstr ollama  # Windows

# Reiniciar
ollama serve
```

#### Porta ocupada
```bash
# Verificar porta 8002
netstat -an | grep 8002

# Matar processo
kill -9 $(lsof -ti:8002)  # Linux/macOS
netstat -ano | findstr :8002  # Windows
```

#### MongoDB não conecta
1. Verificar string de conexão no `.env`
2. Testar com `python Backend/test_mongo.py`
3. Verificar firewall/IP whitelist

### Logs e Debug
```bash
# Logs detalhados
OLLAMA_DEBUG=1 ollama serve

# Backend debug
cd Backend
python main.py --debug
```

## 📱 Acesso ao Sistema

### URLs
- **Dashboard**: http://localhost:8002
- **API Docs**: http://localhost:8002/docs
- **Health Check**: http://localhost:8002/api/health

### Teste Rápido
1. Abrir http://localhost:8002
2. Fazer login com Unity ID de teste
3. Testar chat com "Olá, como está meu solo?"
4. Verificar dashboard com dados

## 🚀 Próximos Passos

1. **Configurar MongoDB** com seus dados
2. **Personalizar prompts** em `Backend/prompts.py`
3. **Ajustar frontend** em `Frontend/`
4. **Integrar Unity** com endpoints
5. **Deploy produção** (opcional)

## 📞 Suporte

### Checklist de Instalação
- [ ] Python 3.11+ instalado
- [ ] Git instalado
- [ ] Ollama instalado e rodando
- [ ] Modelo llama3.2 baixado
- [ ] MongoDB Atlas configurado
- [ ] .env configurado
- [ ] Dependências instaladas
- [ ] API respondendo na porta 8002

### Contato
- **Projeto**: EKKO - Agricultura Gamificada
- **Equipe**: 34DS08
- **Instituição**: ETE FMC, Santa Rita do Sapucaí, MG