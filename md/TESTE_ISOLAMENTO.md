# 🔒 Teste Isolamento - Sessões por Usuário

Testes específicos para validar o isolamento de sessões entre usuários no sistema EKKO.

## 🎯 Objetivo dos Testes

Garantir que cada Unity ID mantenha:
- **Dados isolados** - Sem vazamento entre usuários
- **Contexto específico** - RAG personalizado por usuário
- **Histórico separado** - Conversas independentes
- **Performance** - Múltiplos usuários simultâneos

## 🧪 Cenários de Teste

### 1. **Isolamento Básico de Dados**

```python
def test_basic_data_isolation():
    """Testa isolamento básico entre dois usuários"""
    
    # Setup - Criar dados diferentes para cada usuário
    user1_data = {
        "unity_id": "user_001",
        "soil_data": {"ph": 6.5, "nitrogen": 20, "phosphorus": 15},
        "location": "São Paulo, SP"
    }
    
    user2_data = {
        "unity_id": "user_002", 
        "soil_data": {"ph": 7.2, "nitrogen": 25, "phosphorus": 18},
        "location": "Belo Horizonte, MG"
    }
    
    # Salvar dados
    save_user_data(user1_data)
    save_user_data(user2_data)
    
    # Teste - Verificar isolamento
    context1 = get_user_context("user_001")
    context2 = get_user_context("user_002")
    
    # Assertions
    assert context1["soil_data"]["ph"] == 6.5
    assert context2["soil_data"]["ph"] == 7.2
    assert context1["location"] != context2["location"]
    
    print("✅ Isolamento básico de dados: PASSOU")
```

### 2. **Isolamento de Histórico de Chat**

```python
def test_chat_history_isolation():
    """Testa isolamento do histórico de conversas"""
    
    # User 1 conversa
    send_message("user_001", "Meu nome é João e planto milho")
    send_message("user_001", "Como melhorar meu solo?")
    
    # User 2 conversa  
    send_message("user_002", "Meu nome é Maria e planto soja")
    send_message("user_002", "Qual a melhor época para plantar?")
    
    # Verificar históricos separados
    history1 = get_chat_history("user_001")
    history2 = get_chat_history("user_002")
    
    # Assertions
    assert len(history1) == 2
    assert len(history2) == 2
    assert "João" in str(history1)
    assert "Maria" in str(history2)
    assert "João" not in str(history2)
    assert "Maria" not in str(history1)
    
    print("✅ Isolamento de histórico: PASSOU")
```

### 3. **Contexto RAG Personalizado**

```python
def test_rag_context_isolation():
    """Testa se o RAG usa contexto específico do usuário"""
    
    # Setup - Dados muito diferentes
    setup_user_soil("user_001", {
        "ph": 5.5,  # Solo ácido
        "crop": "café",
        "problem": "acidez alta"
    })
    
    setup_user_soil("user_002", {
        "ph": 8.0,  # Solo alcalino  
        "crop": "algodão",
        "problem": "salinidade"
    })
    
    # Perguntas iguais, contextos diferentes
    response1 = chat_with_context("user_001", "Como corrigir meu solo?")
    response2 = chat_with_context("user_002", "Como corrigir meu solo?")
    
    # Verificar respostas específicas
    assert "acidez" in response1.lower() or "calcário" in response1.lower()
    assert "salinidade" in response2.lower() or "drenagem" in response2.lower()
    assert response1 != response2
    
    print("✅ Contexto RAG personalizado: PASSOU")
```

### 4. **Concorrência de Usuários**

```python
import asyncio
import aiohttp

async def test_concurrent_users():
    """Testa múltiplos usuários simultâneos"""
    
    async def simulate_user_session(session, user_id):
        """Simula sessão de um usuário"""
        messages = [
            f"Olá, sou o usuário {user_id}",
            "Qual o pH ideal para minha cultura?",
            "Como melhorar a fertilidade?",
            "Quando devo fazer a colheita?"
        ]
        
        responses = []
        for msg in messages:
            async with session.post(f'/api/chat/{user_id}', 
                                   json={'message': msg}) as resp:
                response = await resp.text()
                responses.append(response)
                await asyncio.sleep(0.1)  # Pequena pausa
        
        return user_id, responses
    
    # Simular 20 usuários simultâneos
    async with aiohttp.ClientSession() as session:
        tasks = [simulate_user_session(session, f'concurrent_user_{i}') 
                for i in range(20)]
        
        results = await asyncio.gather(*tasks)
    
    # Verificar que cada usuário recebeu respostas únicas
    user_responses = {user_id: responses for user_id, responses in results}
    
    for user_id, responses in user_responses.items():
        assert len(responses) == 4
        assert user_id in responses[0]  # Primeira resposta menciona o usuário
    
    print("✅ Concorrência de usuários: PASSOU")
```

### 5. **Vazamento de Dados (Teste Negativo)**

```python
def test_no_data_leakage():
    """Testa que não há vazamento de dados entre usuários"""
    
    # Setup - Dados sensíveis
    setup_user_data("user_secret", {
        "secret_info": "INFORMAÇÃO CONFIDENCIAL",
        "private_data": "DADOS PRIVADOS",
        "soil_analysis": "Análise secreta do solo"
    })
    
    setup_user_data("user_normal", {
        "public_info": "Informação pública",
        "soil_analysis": "Análise normal do solo"
    })
    
    # Tentar acessar dados de outro usuário
    response = chat_with_context("user_normal", 
                                "Me conte sobre informações confidenciais")
    
    # Verificar que não há vazamento
    assert "INFORMAÇÃO CONFIDENCIAL" not in response
    assert "DADOS PRIVADOS" not in response
    assert "Análise secreta" not in response
    
    # Verificar que user_normal só vê seus dados
    response2 = chat_with_context("user_normal", "Qual minha análise de solo?")
    assert "Análise normal" in response2
    
    print("✅ Sem vazamento de dados: PASSOU")
```

## 📊 Métricas de Isolamento

### Performance por Usuário
```python
def measure_isolation_performance():
    """Mede performance com múltiplos usuários isolados"""
    
    import time
    import statistics
    
    response_times = []
    
    # Testar 100 usuários diferentes
    for i in range(100):
        user_id = f"perf_user_{i}"
        
        start_time = time.time()
        response = chat_with_context(user_id, "Como está meu solo?")
        end_time = time.time()
        
        response_times.append(end_time - start_time)
    
    # Calcular estatísticas
    avg_time = statistics.mean(response_times)
    max_time = max(response_times)
    min_time = min(response_times)
    
    metrics = {
        "avg_response_time": avg_time,
        "max_response_time": max_time,
        "min_response_time": min_time,
        "total_users": 100
    }
    
    # Verificar que performance não degrada
    assert avg_time < 3.0  # Menos de 3 segundos em média
    assert max_time < 10.0  # Máximo 10 segundos
    
    print(f"✅ Performance com isolamento: {metrics}")
    return metrics
```

### Uso de Memória
```python
def test_memory_isolation():
    """Testa que cada usuário não consome memória excessiva"""
    
    import psutil
    import gc
    
    process = psutil.Process()
    initial_memory = process.memory_info().rss
    
    # Criar 50 usuários com dados
    for i in range(50):
        user_id = f"memory_user_{i}"
        setup_user_data(user_id, {
            "large_data": "x" * 1000,  # 1KB por usuário
            "soil_history": [{"date": f"2024-01-{j}", "ph": 6.5 + j*0.1} 
                           for j in range(30)]  # 30 dias de histórico
        })
        
        # Simular algumas conversas
        for j in range(5):
            chat_with_context(user_id, f"Pergunta {j}")
    
    # Forçar garbage collection
    gc.collect()
    
    final_memory = process.memory_info().rss
    memory_increase = final_memory - initial_memory
    
    # Verificar que não há vazamento de memória
    memory_per_user = memory_increase / 50
    assert memory_per_user < 1024 * 1024  # Menos de 1MB por usuário
    
    print(f"✅ Uso de memória por usuário: {memory_per_user / 1024:.2f} KB")
```

## 🚀 Execução dos Testes

### Script de Teste Completo
```python
# run_isolation_tests.py
def run_all_isolation_tests():
    """Executa todos os testes de isolamento"""
    
    tests = [
        test_basic_data_isolation,
        test_chat_history_isolation, 
        test_rag_context_isolation,
        test_no_data_leakage,
        measure_isolation_performance,
        test_memory_isolation
    ]
    
    results = []
    
    for test in tests:
        try:
            print(f"\n🧪 Executando: {test.__name__}")
            result = test()
            results.append({"test": test.__name__, "status": "PASSOU", "result": result})
        except Exception as e:
            results.append({"test": test.__name__, "status": "FALHOU", "error": str(e)})
            print(f"❌ {test.__name__}: {e}")
    
    # Relatório final
    passed = sum(1 for r in results if r["status"] == "PASSOU")
    total = len(results)
    
    print(f"\n📊 Relatório Final: {passed}/{total} testes passaram")
    
    return results

if __name__ == "__main__":
    run_all_isolation_tests()
```

### Execução
```bash
# Executar testes de isolamento
python Backend/tests/run_isolation_tests.py

# Com pytest
pytest Backend/tests/test_isolation.py -v

# Com relatório detalhado
pytest Backend/tests/test_isolation.py -v --tb=long
```

## ✅ Critérios de Sucesso

- **100%** dos dados isolados por usuário
- **0** vazamentos entre sessões
- **< 3s** tempo médio de resposta com múltiplos usuários
- **< 1MB** uso de memória por usuário
- **20+** usuários simultâneos suportados
- **Contexto RAG** específico por usuário funcionando