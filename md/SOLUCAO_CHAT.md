# 🔧 Solução Chat - Troubleshooting

Guia de solução de problemas do sistema de chat EKKO.

## 🚨 Problemas Comuns

### 1. **Ollama não conecta**

**Sintomas:**
- Erro "Connection refused" na porta 11434
- Chat não responde
- Health check falha

**Soluções:**
```bash
# Verificar se Ollama está rodando
curl http://localhost:11434/api/tags

# Iniciar Ollama
ollama serve

# Verificar processo
ps aux | grep ollama  # Linux/macOS
tasklist | findstr ollama  # Windows
```

### 2. **Modelo Llama 3.2 não encontrado**

**Sintomas:**
- Erro "model not found"
- Resposta vazia do chat

**Soluções:**
```bash
# Baixar modelo
ollama pull llama3.2

# Verificar modelos instalados
ollama list

# Testar modelo
ollama run llama3.2 "teste"
```

### 3. **MongoDB não conecta**

**Sintomas:**
- Erro de conexão com banco
- Contexto do usuário não carrega

**Soluções:**
```python
# Testar conexão MongoDB
python Backend/test_mongo.py

# Verificar .env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGO_DB_NAME=EKKOnUnity
```

### 4. **Streaming não funciona**

**Sintomas:**
- Resposta aparece toda de uma vez
- EventSource não conecta

**Soluções:**
```javascript
// Verificar EventSource
const eventSource = new EventSource(`/api/chat/${unityId}`);
eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
};

// Fallback para polling
if (!window.EventSource) {
    // Implementar polling
}
```

## 🔍 Debug e Logs

### Backend Logs
```python
# Ativar logs detalhados
import logging
logging.basicConfig(level=logging.DEBUG)

# Log específico do chat
logger = logging.getLogger("chat")
logger.debug(f"Mensagem recebida: {message}")
```

### Frontend Debug
```javascript
// Console debug
console.log('Unity ID:', unityId);
console.log('Mensagem enviada:', message);

// Network tab para verificar requests
// DevTools → Network → XHR/Fetch
```

### Ollama Debug
```bash
# Logs detalhados Ollama
OLLAMA_DEBUG=1 ollama serve

# Verificar uso de memória
ollama ps

# Logs do sistema
journalctl -u ollama  # Linux
```

## ⚡ Performance Issues

### 1. **Resposta lenta**

**Causas:**
- Modelo muito grande
- Pouca memória RAM
- Contexto muito longo

**Soluções:**
```env
# Reduzir timeout
OLLAMA_TIMEOUT=60

# Limitar tokens
OLLAMA_MAX_TOKENS=1024

# Usar modelo menor
OLLAMA_MODEL=llama3.2:1b
```

### 2. **Memória insuficiente**

**Sintomas:**
- Ollama trava
- Sistema lento
- Out of memory errors

**Soluções:**
```bash
# Verificar uso de memória
free -h  # Linux
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory  # Windows

# Usar modelo menor
ollama pull llama3.2:1b
```

## 🛠️ Ferramentas de Debug

### Health Check Completo
```python
# Backend/debug_health.py
def full_health_check():
    # Testar Ollama
    # Testar MongoDB
    # Testar endpoints
    # Gerar relatório
```

### Monitor de Performance
```javascript
// Frontend performance monitor
const perfMonitor = {
    startTime: Date.now(),
    measureResponse: () => {
        return Date.now() - perfMonitor.startTime;
    }
};
```

### Logs Estruturados
```python
# Formato JSON para logs
import json
import datetime

def log_chat_event(event, data):
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "event": event,
        "data": data
    }
    print(json.dumps(log_entry))
```

## 📞 Suporte

### Checklist de Diagnóstico
- [ ] Ollama rodando na porta 11434
- [ ] Modelo llama3.2 instalado
- [ ] MongoDB conectado
- [ ] .env configurado corretamente
- [ ] Firewall/antivírus não bloqueando
- [ ] Memória RAM suficiente (>4GB)
- [ ] Navegador suporta EventSource