# 🚀 Backend Completo - Arquitetura EKKO

Documentação completa da arquitetura backend do sistema EKKO.

## 🏗️ Arquitetura Geral

```
Unity Game → FastAPI → MongoDB Atlas → Ollama Llama 3.2
     ↓           ↓           ↓              ↓
  Unity ID → Endpoints → Collections → IA Chatbot
```

## 📊 Componentes Principais

### 1. **FastAPI Server** (`main.py`)
- **11 endpoints** REST API
- **CORS** habilitado para frontend
- **Middleware** de logging e error handling
- **Documentação** automática Swagger

### 2. **Sistema IA** (`ai_analyzer.py`)
- **9 parâmetros** de análise de solo
- **Algoritmos** de recomendação
- **Previsões** de colheita e sustentabilidade
- **Scoring** inteligente

### 3. **Chatbot IA** (`ai_connector.py`)
- **Ollama** integration com Llama 3.2
- **Streaming** de respostas (SSE)
- **RAG** com contexto MongoDB
- **Sessões** isoladas por Unity ID

### 4. **Database** (`database.py`)
- **MongoDB Atlas** cloud database
- **2 Collections**: `users` e `chat_sessions`
- **Indexes** otimizados para performance
- **Connection pooling**

### 5. **Prompts System** (`prompts.py`)
- **Sistema base** para agricultura
- **Contexto RAG** personalizado
- **Templates** de resposta
- **Geolocalização** INMET

## 🔗 API Endpoints Detalhados

### Unity Integration (7 endpoints)

#### `GET /unity/status`
```python
@app.get("/unity/status")
async def unity_status():
    """Status da API e conexões"""
    return {
        "status": "online",
        "database": "connected",
        "ollama": "available",
        "timestamp": datetime.now()
    }
```

#### `GET /unity/login/{user_id}`
```python
@app.get("/unity/login/{user_id}")
async def unity_login(user_id: str):
    """Login/registro de usuário Unity"""
    user = await get_or_create_user(user_id)
    return {
        "success": True,
        "user_id": user_id,
        "profile": user.get("profile", {}),
        "first_login": user.get("created_at") == datetime.now()
    }
```

#### `GET /unity/dashboard/{user_id}`
```python
@app.get("/unity/dashboard/{user_id}")
async def get_dashboard_data(user_id: str):
    """Dados completos para dashboard"""
    user_data = await get_user_data(user_id)
    ai_analysis = await analyze_soil_ai(user_data["soil_data"])
    
    return {
        "profile": user_data["profile"],
        "soil_data": user_data["soil_data"],
        "ai_analysis": ai_analysis,
        "recommendations": generate_recommendations(ai_analysis),
        "charts_data": prepare_charts_data(user_data),
        "monitoring": get_real_time_monitoring(user_id)
    }
```

#### `POST /unity/soil/save/{user_id}`
```python
@app.post("/unity/soil/save/{user_id}")
async def save_soil_data(user_id: str, soil_data: SoilData):
    """Salvar dados de solo da simulação Unity"""
    processed_data = process_soil_data(soil_data)
    await save_user_soil_data(user_id, processed_data)
    
    return {
        "success": True,
        "message": "Dados salvos com sucesso",
        "processed_parameters": len(processed_data),
        "timestamp": datetime.now()
    }
```

#### `GET /unity/analise-ia/{user_id}`
```python
@app.get("/unity/analise-ia/{user_id}")
async def get_ai_analysis(user_id: str):
    """Análise IA completa (9 parâmetros)"""
    user_data = await get_user_data(user_id)
    analysis = await ai_analyzer.analyze_complete(user_data["soil_data"])
    
    return {
        "analysis": analysis,
        "score": analysis["overall_score"],
        "recommendations": analysis["recommendations"],
        "predictions": analysis["predictions"],
        "sustainability": analysis["sustainability_score"]
    }
```

#### `GET /unity/monitoring/{user_id}`
```python
@app.get("/unity/monitoring/{user_id}")
async def get_monitoring_data(user_id: str):
    """Dados de monitoramento em tempo real"""
    return {
        "current_conditions": get_current_conditions(user_id),
        "alerts": get_active_alerts(user_id),
        "trends": calculate_trends(user_id),
        "next_actions": suggest_next_actions(user_id)
    }
```

#### `GET /unity/recreate-test-data`
```python
@app.get("/unity/recreate-test-data")
async def recreate_test_data():
    """Recriar dados de teste para desenvolvimento"""
    test_users = await create_test_users()
    return {
        "success": True,
        "test_users_created": len(test_users),
        "users": test_users
    }
```

### Chatbot IA (4 endpoints)

#### `POST /api/chat/{unity_id}`
```python
@app.post("/api/chat/{unity_id}")
async def chat_stream(unity_id: str, message: ChatMessage):
    """Chat streaming com contexto RAG"""
    
    async def generate_response():
        # Buscar contexto do usuário
        context = await get_user_context(unity_id)
        
        # Gerar resposta com Ollama
        async for chunk in ollama_stream_chat(message.content, context):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream"
    )
```

#### `POST /api/generate_title`
```python
@app.post("/api/generate_title")
async def generate_conversation_title(messages: List[ChatMessage]):
    """Gerar título automático da conversa"""
    conversation_text = " ".join([msg.content for msg in messages[:3]])
    title = await generate_title_with_ai(conversation_text)
    
    return {"title": title}
```

#### `GET /api/soil-tips/{unity_id}`
```python
@app.get("/api/soil-tips/{unity_id}")
async def get_soil_improvement_tips(unity_id: str):
    """Dicas personalizadas de melhoria de solo"""
    user_data = await get_user_data(unity_id)
    analysis = await ai_analyzer.analyze_complete(user_data["soil_data"])
    tips = generate_improvement_tips(analysis)
    
    return {
        "tips": tips,
        "priority": tips["priority_actions"],
        "timeline": tips["implementation_timeline"]
    }
```

#### `GET /api/health`
```python
@app.get("/api/health")
async def health_check():
    """Health check completo do sistema"""
    return {
        "api": "healthy",
        "database": await check_mongodb_health(),
        "ollama": await check_ollama_health(),
        "timestamp": datetime.now()
    }
```

## 🧠 Sistema IA Avançado

### Análise de 9 Parâmetros
```python
class SoilAnalyzer:
    def __init__(self):
        self.parameters = [
            "ph", "humidity", "temperature", "salinity", 
            "conductivity", "nitrogen", "phosphorus", 
            "potassium", "organic_matter"
        ]
    
    async def analyze_complete(self, soil_data):
        """Análise completa dos 9 parâmetros"""
        analysis = {}
        
        for param in self.parameters:
            analysis[param] = await self.analyze_parameter(
                param, soil_data[param]
            )
        
        # Score geral
        analysis["overall_score"] = self.calculate_overall_score(analysis)
        
        # Recomendações
        analysis["recommendations"] = self.generate_recommendations(analysis)
        
        # Previsões
        analysis["predictions"] = self.generate_predictions(analysis)
        
        return analysis
```

### Algoritmos de Recomendação
```python
def generate_recommendations(analysis):
    """Gera recomendações baseadas na análise"""
    recommendations = []
    
    # pH
    if analysis["ph"]["status"] == "low":
        recommendations.append({
            "type": "ph_correction",
            "action": "Aplicar calcário",
            "quantity": calculate_lime_needed(analysis["ph"]["value"]),
            "priority": "high"
        })
    
    # NPK
    npk_needs = calculate_npk_needs(analysis)
    if npk_needs:
        recommendations.append({
            "type": "fertilization",
            "action": "Aplicar fertilizante NPK",
            "formula": npk_needs["formula"],
            "priority": "medium"
        })
    
    return recommendations
```

## 🗄️ Estrutura MongoDB

### Collection `users`
```json
{
  "_id": "unity_id_123",
  "profile": {
    "name": "João Silva",
    "location": "São Paulo, SP",
    "farm_size": 50,
    "main_crops": ["milho", "soja"],
    "experience_level": "intermediate"
  },
  "soil_data": {
    "ph": 6.5,
    "humidity": 45.2,
    "temperature": 25.8,
    "salinity": 0.3,
    "conductivity": 1.2,
    "nitrogen": 20,
    "phosphorus": 15,
    "potassium": 180,
    "organic_matter": 3.5
  },
  "analysis_history": [
    {
      "date": "2024-01-15T10:30:00Z",
      "overall_score": 78,
      "recommendations": [...],
      "predictions": {...}
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Collection `chat_sessions`
```json
{
  "_id": ObjectId("..."),
  "unity_id": "unity_id_123",
  "session_id": "session_456",
  "messages": [
    {
      "role": "user",
      "content": "Como melhorar meu solo?",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "assistant", 
      "content": "Baseado na análise do seu solo...",
      "timestamp": "2024-01-15T10:30:15Z"
    }
  ],
  "title": "Melhoria de Solo",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

## 🔧 Configuração e Deploy

### Variáveis de Ambiente
```env
# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGO_DB_NAME=EKKOnUnity

# API
API_PORT=8002
API_HOST=0.0.0.0
DEBUG=false

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT=120

# INMET (dados climáticos)
INMET_API_KEY=your_api_key
```

### Dependências (`requirements_unity.txt`)
```txt
fastapi==0.104.1
uvicorn==0.24.0
pymongo==4.6.0
motor==3.3.2
pydantic==2.5.0
python-multipart==0.0.6
python-dotenv==1.0.0
requests==2.31.0
aiohttp==3.9.1
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
```

### Inicialização
```python
# main.py
if __name__ == "__main__":
    import uvicorn
    
    # Configurar logging
    setup_logging()
    
    # Inicializar conexões
    await init_database()
    await init_ollama()
    
    # Iniciar servidor
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=False,
        log_level="info"
    )
```

## 📈 Performance e Monitoramento

### Métricas Coletadas
- **Response time** por endpoint
- **Throughput** de requests
- **Uso de memória** por usuário
- **Conexões MongoDB** ativas
- **Status Ollama** e tempo de resposta

### Logging Estruturado
```python
import logging
import json

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
def log_api_call(endpoint, user_id, response_time):
    log_data = {
        "event": "api_call",
        "endpoint": endpoint,
        "user_id": user_id,
        "response_time": response_time,
        "timestamp": datetime.now().isoformat()
    }
    logging.info(json.dumps(log_data))
```

## 🚀 Próximas Melhorias

- **Cache Redis** para performance
- **Rate limiting** por usuário
- **Backup automático** MongoDB
- **Métricas Prometheus** 
- **Health checks** avançados
- **Load balancing** para múltiplas instâncias