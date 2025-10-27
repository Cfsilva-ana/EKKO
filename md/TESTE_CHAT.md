# 🧪 Testes Chat - Casos de Teste

Documentação completa dos testes do sistema de chat EKKO.

## 🎯 Estratégia de Testes

### Tipos de Teste
1. **Unitários** - Componentes individuais
2. **Integração** - Ollama + MongoDB + API
3. **E2E** - Fluxo completo usuário
4. **Performance** - Carga e stress
5. **Isolamento** - Sessões por usuário

## 🔧 Testes Unitários

### Backend - API Endpoints
```python
# test_chat_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chat_endpoint():
    response = client.post("/api/chat/test_user", 
                          json={"message": "Olá"})
    assert response.status_code == 200

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert "ollama" in response.json()
```

### Frontend - JavaScript
```javascript
// test_chat.js
describe('Chat System', () => {
    test('should send message', async () => {
        const response = await sendMessage('test', 'Olá');
        expect(response).toBeDefined();
    });

    test('should handle streaming', () => {
        const eventSource = new EventSource('/api/chat/test');
        expect(eventSource.readyState).toBe(EventSource.CONNECTING);
    });
});
```

## 🔗 Testes de Integração

### Ollama + Backend
```python
# test_ollama_integration.py
def test_ollama_connection():
    """Testa conexão com Ollama"""
    response = requests.get("http://localhost:11434/api/tags")
    assert response.status_code == 200
    
def test_llama_model():
    """Testa modelo Llama 3.2"""
    models = response.json()["models"]
    assert any("llama3.2" in model["name"] for model in models)

def test_chat_with_context():
    """Testa chat com contexto RAG"""
    context = get_user_context("test_user")
    response = chat_with_ollama("Como está meu solo?", context)
    assert "pH" in response or "solo" in response.lower()
```

### MongoDB + Backend
```python
# test_mongo_integration.py
def test_user_data_retrieval():
    """Testa busca de dados do usuário"""
    user_data = get_user_data("test_user")
    assert "soil_data" in user_data
    assert "profile" in user_data

def test_chat_history_save():
    """Testa salvamento do histórico"""
    save_chat_message("test_user", "user", "Teste")
    history = get_chat_history("test_user")
    assert len(history) > 0
```

## 🌐 Testes End-to-End

### Fluxo Completo
```javascript
// test_e2e.js
describe('Chat E2E Flow', () => {
    test('complete chat interaction', async () => {
        // 1. Abrir chat
        await page.goto('http://localhost:8002');
        
        // 2. Enviar mensagem
        await page.fill('#message-input', 'Como melhorar meu solo?');
        await page.click('#send-button');
        
        // 3. Verificar resposta
        await page.waitForSelector('.bot-message');
        const response = await page.textContent('.bot-message');
        expect(response).toContain('solo');
        
        // 4. Verificar streaming
        await page.waitForFunction(() => {
            return document.querySelectorAll('.bot-message').length > 0;
        });
    });
});
```

## ⚡ Testes de Performance

### Carga de Usuários
```python
# test_load.py
import asyncio
import aiohttp

async def simulate_user(session, user_id):
    """Simula um usuário enviando mensagens"""
    for i in range(10):
        async with session.post(f'/api/chat/{user_id}', 
                               json={'message': f'Mensagem {i}'}) as resp:
            assert resp.status == 200

async def test_concurrent_users():
    """Testa 50 usuários simultâneos"""
    async with aiohttp.ClientSession() as session:
        tasks = [simulate_user(session, f'user_{i}') 
                for i in range(50)]
        await asyncio.gather(*tasks)
```

### Stress Test
```python
# test_stress.py
def test_memory_usage():
    """Monitora uso de memória durante teste"""
    import psutil
    process = psutil.Process()
    
    initial_memory = process.memory_info().rss
    
    # Executar 1000 requests
    for i in range(1000):
        response = client.post("/api/chat/stress_test", 
                              json={"message": f"Teste {i}"})
    
    final_memory = process.memory_info().rss
    memory_increase = final_memory - initial_memory
    
    # Não deve aumentar mais que 100MB
    assert memory_increase < 100 * 1024 * 1024
```

## 🔒 Testes de Isolamento

### Sessões por Usuário
```python
# test_isolation.py
def test_user_isolation():
    """Testa isolamento entre usuários"""
    # Usuário 1
    client.post("/api/chat/user1", json={"message": "Meu nome é João"})
    
    # Usuário 2
    client.post("/api/chat/user2", json={"message": "Meu nome é Maria"})
    
    # Verificar que user1 não vê dados de user2
    response1 = client.post("/api/chat/user1", 
                           json={"message": "Qual meu nome?"})
    assert "João" in response1.text
    assert "Maria" not in response1.text

def test_context_isolation():
    """Testa isolamento de contexto"""
    # Configurar dados diferentes para cada usuário
    set_user_soil_data("user1", {"ph": 6.5})
    set_user_soil_data("user2", {"ph": 7.2})
    
    # Verificar contexto específico
    response1 = client.post("/api/chat/user1", 
                           json={"message": "Qual o pH do meu solo?"})
    assert "6.5" in response1.text
    assert "7.2" not in response1.text
```

## 📊 Relatórios de Teste

### Coverage Report
```bash
# Gerar relatório de cobertura
pytest --cov=Backend --cov-report=html

# Visualizar em: htmlcov/index.html
```

### Performance Metrics
```python
# test_metrics.py
def generate_performance_report():
    """Gera relatório de performance"""
    metrics = {
        "response_time_avg": measure_avg_response_time(),
        "throughput": measure_throughput(),
        "memory_usage": measure_memory_usage(),
        "concurrent_users": test_max_concurrent_users()
    }
    
    with open("performance_report.json", "w") as f:
        json.dump(metrics, f, indent=2)
```

## 🚀 Automação de Testes

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Chat Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install Ollama
        run: curl -fsSL https://ollama.ai/install.sh | sh
      - name: Pull Llama 3.2
        run: ollama pull llama3.2
      - name: Run Tests
        run: pytest Backend/tests/
```

### Testes Locais
```bash
# Executar todos os testes
pytest Backend/tests/ -v

# Testes específicos
pytest Backend/tests/test_chat.py -v

# Com coverage
pytest --cov=Backend Backend/tests/
```