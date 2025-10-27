"""
EKKO - API Principal
FastAPI com MongoDB Atlas
"""

# Imports do sistema e de bibliotecas
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import uuid
import uvicorn
from dotenv import load_dotenv
import os
import requests
import json
import re
import random
# Imports locais
from database import unity_profiles, unity_soil_data, API_HOST, API_PORT, API_DEBUG, client, DB_NAME
from ai_analyzer import analyze_soil_complete, get_main_crop, count_ideal_parameters, analyze_trend, calculate_sustainability, calculate_soil_health
import tool
import prompts
import ai_connector

load_dotenv()
app = FastAPI(title="EKKO API ", version="Debug")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Servir arquivos estáticos do Frontend
import pathlib
frontend_path = pathlib.Path(__file__).parent.parent / "Frontend"
if frontend_path.exists():
    app.mount("/pages", StaticFiles(directory=str(frontend_path / "pages"), html=True), name="pages")
    app.mount("/css", StaticFiles(directory=str(frontend_path / "css")), name="css")
    app.mount("/js", StaticFiles(directory=str(frontend_path / "js")), name="js")
    app.mount("/assets", StaticFiles(directory=str(frontend_path / "assets")), name="assets")


# Rota raiz
from fastapi.responses import RedirectResponse

@app.get("/")
def root():
    return RedirectResponse(url="/pages/dashboard.html?unityId=unity_bf87c29494e0")

# Modelos
class UnityProfile(BaseModel):
    nome: str
    email: str
    telefone: str
    cpf: str
    propriedade: Dict[str, Any]

class SoilData(BaseModel):
    session_id: str
    ph: float
    umidade: float
    temperatura: float
    salinidade: float
    condutividade: float
    nitrogenio: float
    fosforo: float
    potassio: float
    # Campos opcionais
    densidade: Optional[float] = 1.2
    materia_organica: Optional[float] = 3.5
    calcio: Optional[float] = 500
    magnesio: Optional[float] = 120
    enxofre: Optional[float] = 20
    player_actions: Optional[Dict[str, Any]] = None
    game_metrics: Optional[Dict[str, Any]] = None
    cultivo_atual: Optional[str] = "Milho"
    estacao: Optional[str] = "Crescimento"

@app.get("/unity/status")
def get_status():
    try:
        # Testar conexão
        client.admin.command('ping')
        
        # Contar documentos
        profiles_count = unity_profiles.count_documents({})
        soil_count = unity_soil_data.count_documents({})
        
        return {
            "status": "online",
            "database": "connected",
            "db_name": DB_NAME,
            "profiles": profiles_count,
            "soil_data": soil_count
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }

@app.post("/unity/profile/create")
def create_profile(profile: UnityProfile):
    unity_id = f"unity_{uuid.uuid4().hex[:12]}"
    
    profile_doc = {
        "_id": unity_id,
        "dados_pessoais": {
            "nome": profile.nome,
            "email": profile.email,
            "telefone": profile.telefone,
            "cpf": profile.cpf
        },
        "propriedade": profile.propriedade,
        "unity_stats": {
            "total_sessions": 0,
            "best_score": 0,
            "total_playtime": 0
        },
        "created_at": datetime.utcnow(),
        "status": "active"
    }
    
    unity_profiles.insert_one(profile_doc)
    
    return {
        "status": "success",
        "unity_id": unity_id,
        "message": "Perfil criado no Atlas"
    }

@app.get("/unity/login/{unity_id}")
def login(unity_id: str):
    profile = unity_profiles.find_one({"_id": unity_id})
    
    if not profile:
        raise HTTPException(status_code=404, detail="ID não encontrado")
    
    return {
        "status": "success",
        "unity_id": unity_id,
        "profile": profile
    }

@app.post("/unity/soil/save/{unity_id}")
def save_soil(unity_id: str, soil: SoilData):
    # Verificar se perfil existe
    if not unity_profiles.find_one({"_id": unity_id}):
        raise HTTPException(status_code=404, detail="ID não encontrado")
    
    # Valores padrão para campos não enviados pelo Unity
    default_actions = {
        "irrigacao": round(soil.umidade * 0.8, 2),
        "fertilizante_npk": {
            "N": round(soil.nitrogenio * 0.4, 2),
            "P": round(soil.fosforo * 0.2, 2),
            "K": round(soil.potassio * 0.3, 2)
        },
        "calagem": round(0.5, 2),
        "materia_organica_adicionada": round(1.0, 2)
    }
    
    default_metrics = {
        "score": int((soil.ph * 100) + (soil.umidade * 10)),
        "money_spent": round(soil.condutividade * 200, 2),
        "sustainability_index": round(min(soil.ph / 7.0, 1.0), 2),
        "productivity_estimate": int((soil.nitrogenio + soil.fosforo + soil.potassio) / 3)
    }
    
    soil_doc = {
        "_id": f"soil_{unity_id}_{int(datetime.utcnow().timestamp())}",
        "unity_id": unity_id,
        "timestamp": datetime.utcnow(),
        "soil_parameters": {
            "ph": round(soil.ph, 2),
            "umidade": round(soil.umidade, 2),
            "temperatura": round(soil.temperatura, 2),
            "salinidade": round(soil.salinidade, 2),
            "condutividade": round(soil.condutividade, 2),
            "densidade": round(soil.densidade, 2),
            "materia_organica": round(soil.materia_organica, 2)
        },
        "nutrients": {
            "nitrogenio": round(soil.nitrogenio, 2),
            "fosforo": round(soil.fosforo, 2),
            "potassio": round(soil.potassio, 2),
            "calcio": round(soil.calcio, 2),
            "magnesio": round(soil.magnesio, 2),
            "enxofre": round(soil.enxofre, 2)
        },
        "player_actions": soil.player_actions or default_actions,
        "game_metrics": soil.game_metrics or default_metrics,
        "cultivo_atual": soil.cultivo_atual,
        "estacao": soil.estacao,
        "health_score": int((soil.ph * 10) + (soil.umidade * 0.5) + 30)
    }
    
    result = unity_soil_data.insert_one(soil_doc)
    
    return {
        "status": "success",
        "soil_id": str(result.inserted_id),
        "message": "Dados salvos no Atlas"
    }

@app.get("/unity/dashboard/{unity_id}")
def get_dashboard(unity_id: str):
    # Buscar perfil
    profile = unity_profiles.find_one({"_id": unity_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Unity ID não encontrado")
    
    # Buscar dados solo mais recentes
    latest_soil = unity_soil_data.find_one(
        {"unity_id": unity_id},
        sort=[("timestamp", -1)]
    )
    
    # Buscar histórico de solo para mapas
    soil_history = list(unity_soil_data.find(
        {"unity_id": unity_id}
    ).sort("timestamp", -1).limit(20))
    
    return {
        "status": "success",
        "unity_id": unity_id,
        "profile": profile,
        "latest_soil_data": latest_soil,
        "soil_history": soil_history,
        "dashboard_data": {
            "nome": profile["dados_pessoais"]["nome"],
            "propriedade": profile["propriedade"].get("nome", "N/A"),
            "area": profile["propriedade"].get("area_hectares", 0),
            "soil_health": calculate_soil_health(latest_soil) if latest_soil else 50
        }
    }

@app.get("/unity/ids")
def list_ids():
    profiles = list(unity_profiles.find({}, {"_id": 1}))
    unity_ids = [p["_id"] for p in profiles]
    
    return {
        "status": "success",
        "total_ids": len(unity_ids),
        "unity_ids": unity_ids
    }

@app.get("/unity/monitoring/{unity_id}")
def get_monitoring_data(unity_id: str, period: str = "24h"):
    from datetime import datetime, timedelta
    
    # Validar usuário
    if not unity_profiles.find_one({"_id": unity_id}):
        raise HTTPException(status_code=404, detail="Unity ID não encontrado")
    
    # Calcular data limite baseada no período real
    now = datetime.utcnow()
    time_deltas = {
        "1h": timedelta(hours=1),
        "6h": timedelta(hours=6), 
        "24h": timedelta(hours=24),
        "7d": timedelta(days=7)
    }
    
    time_limit = now - time_deltas.get(period, timedelta(hours=24))
    
    # Buscar dados filtrados por timestamp real
    soil_data = list(unity_soil_data.find({
        "unity_id": unity_id,
        "timestamp": {"$gte": time_limit}
    }).sort("timestamp", -1))
    
    # Converter formato para frontend
    monitoring_data = []
    for item in soil_data:
        # Calcular status baseado nos parâmetros
        ph = item["soil_parameters"]["ph"]
        status = "ideal" if 6.0 <= ph <= 7.0 else "atencao" if 5.5 <= ph <= 7.5 else "critico"
        
        monitoring_data.append({
            "hora": item["timestamp"].strftime("%H:%M"),
            "ph": item["soil_parameters"]["ph"],
            "umidade": item["soil_parameters"]["umidade"],
            "temp": item["soil_parameters"]["temperatura"],
            "salinidade": item["soil_parameters"]["salinidade"],
            "condutividade": item["soil_parameters"]["condutividade"],
            "n": item["nutrients"]["nitrogenio"],
            "p": item["nutrients"]["fosforo"],
            "k": item["nutrients"]["potassio"],
            "status": status
        })
    
    return {
        "status": "success",
        "unity_id": unity_id,
        "period": period,
        "time_filter": {
            "from": time_limit.isoformat(),
            "to": now.isoformat(),
            "total_found": len(monitoring_data)
        },
        "data": monitoring_data
    }

@app.get("/unity/analise-ia/{unity_id}")
def analise_ia(unity_id: str):
    profile = unity_profiles.find_one({"_id": unity_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Unity ID não encontrado")
    
    # Buscar dados de solo mais recentes
    latest_soil = unity_soil_data.find_one(
        {"unity_id": unity_id},
        sort=[("timestamp", -1)]
    )
    
    # Buscar histórico para análise de tendências
    soil_history = list(unity_soil_data.find(
        {"unity_id": unity_id}
    ).sort("timestamp", -1).limit(10))
    
    # Análise completa
    diagnostico = analyze_soil_complete(latest_soil, soil_history, profile)
    
    return {
        "status": "success",
        "unity_id": unity_id,
        "cultivo_principal": get_main_crop(profile),
        "diagnostico": diagnostico,
        "resumo": {
            "parametros_ideais": count_ideal_parameters(diagnostico["parametros"]),
            "total_parametros": len(diagnostico["parametros"]),
            "tendencia_geral": analyze_trend(soil_history),
            "nivel_sustentabilidade": calculate_sustainability(latest_soil, profile)
        }
    }


class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = []
    coordinates: Optional[Dict[str, float]] = None

class TitleRequest(BaseModel):
    message: str

@app.post("/api/chat/{unity_id}")
def chat(unity_id: str, request: ChatRequest):
    user_message = request.message
    
    def stream_generation():
        try:
            print("\n\n--- ROTA /api/chat ACIONADA ---")
            print(f"-> Pergunta Recebida: '{user_message}'")
            
            # ETAPA 1: RECOLHA DE CONTEXTO
            yield f'data: {json.dumps({"type": "status", "message": "Recolhendo dados..."})}\n\n'
            
            print("--> A recolher contexto do MongoDB...")
            profile = unity_profiles.find_one({"_id": unity_id})
            latest_soil = unity_soil_data.find_one({"unity_id": unity_id}, sort=[("timestamp", -1)])
            
            player_context = ""
            if profile:
                player_context += f"AGRICULTOR: {profile.get('dados_pessoais', {}).get('nome', 'N/A')}\n"
                player_context += f"PROPRIEDADE: {profile.get('propriedade', {}).get('nome', 'N/A')}\n"
                player_context += f"ÁREA: {profile.get('propriedade', {}).get('area_hectares', 0)} hectares\n"
                player_context += f"CULTIVO: {profile.get('propriedade', {}).get('cultivo_principal', 'N/A')}\n\n"
            
            if latest_soil:
                player_context += f"DADOS DO SOLO (mais recente):\n"
                player_context += f"- pH: {latest_soil.get('soil_parameters', {}).get('ph', 'N/A')}\n"
                player_context += f"- Umidade: {latest_soil.get('soil_parameters', {}).get('umidade', 'N/A')}%\n"
                player_context += f"- Temperatura: {latest_soil.get('soil_parameters', {}).get('temperatura', 'N/A')}°C\n"
                player_context += f"- NPK: N={latest_soil.get('nutrients', {}).get('nitrogenio', 'N/A')}, "
                player_context += f"P={latest_soil.get('nutrients', {}).get('fosforo', 'N/A')}, "
                player_context += f"K={latest_soil.get('nutrients', {}).get('potassio', 'N/A')}\n"
                player_context += f"- Cultivo atual: {latest_soil.get('cultivo_atual', 'N/A')}\n"
            
            if not player_context:
                player_context = "Nenhum dado disponível para este agricultor."
            
            print(f"--> Contexto MongoDB: {player_context[:150]}...")

            print("--> A recolher contexto da base local (RAG)...")
            local_context = tool.local_database_search(user_message)
            print(f"--> Contexto RAG: {local_context[:100]}...")
            
            print("--> A recolher contexto da Web...")
            web_context = tool.focused_web_search(user_message)
            print(f"--> Contexto Web: {web_context[:100]}...")

            weather_context = ""
            weather_keywords = ["clima", "tempo", "chuva", "geada", "temperatura", "previsão"]
            if request.coordinates and any(keyword in user_message.lower() for keyword in weather_keywords):
                print("--> A recolher contexto de Clima (INMET)...")
                weather_context = tool.get_inmet_forecast(lat=request.coordinates['latitude'], lon=request.coordinates['longitude'])
                print(f"--> Contexto Clima: {weather_context[:100]}...")
                
            long_term_memory = tool.recall_memories()

            # ETAPA 2: MONTAGEM DO PROMPT
            print("-> A montar o prompt mestre...")
            final_prompt = prompts.MASTER_PROMPT.format(
                player_context=player_context, 
                local_context=local_context,
                web_context=web_context, 
                weather_context=weather_context,
                history="\n".join(request.history), 
                user_message=user_message
            )

            # ETAPA 3: EXECUÇÃO E STREAMING
            print("-> A enviar prompt para a IA via conector...")
            response = ai_connector.get_ollama_response(final_prompt, stream=True)
            
            print("-> A receber streaming da IA e a enviar para o frontend...")
            for chunk in response.iter_lines():
                if chunk:
                    try:
                        json_chunk = json.loads(chunk)
                        message = json_chunk.get("message", {}).get("content", "")
                        if message:
                            yield f'data: {json.dumps({"type": "chunk", "message": message})}\n\n'
                    except json.JSONDecodeError:
                        continue
            
            print("--- FIM DO FLUXO DE CHAT ---")
        
        except Exception as e:
            print(f"!!!!!!!!!!!!!! ERRO CRÍTICO NO FLUXO DE CHAT !!!!!!!!!!!!!!")
            print(f"!!! TIPO DE ERRO: {type(e).__name__}")
            print(f"!!! MENSAGEM: {e}")
            print(f"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            yield f'data: {json.dumps({"type": "chunk", "message": "Ocorreu um erro crítico no meu processamento. Verifique o terminal do servidor."})}\n\n'

    return StreamingResponse(stream_generation(), media_type='text/event-stream')

@app.post("/api/generate_title")
def generate_title(request: TitleRequest):
    try:
        prompt = f"Gere um título de 2-3 palavras para: '{request.message[:50]}'"
        response = ai_connector.get_ollama_response(prompt, stream=False)
        data = response.json()
        title = data.get('message', {}).get('content', 'Nova Conversa')
        
        title = title.strip().replace('"', '').replace("'", '').replace(':', '')
        words = title.split()[:3]
        final_title = ' '.join(words)
        
        return {"title": final_title}
    except Exception as e:
        return {"title": "Nova Conversa"}

class SoilTipRequest(BaseModel):
    parametro: str
    valor: float
    cultivo: str

@app.post("/api/soil-tips/{unity_id}")
def get_soil_tips(unity_id: str, request: SoilTipRequest):
    try:
        profile = unity_profiles.find_one({"_id": unity_id})
        cultivo = request.cultivo or profile.get('propriedade', {}).get('cultivo_principal', 'cultivo geral')
        
        prompt = f"""Você é um especialista em agricultura. Dê 3 dicas práticas de como melhorar o {request.parametro} do solo para cultivo de {cultivo}. Valor atual: {request.valor}.

Formate assim:
1. [Dica 1]
2. [Dica 2]
3. [Dica 3]

Seja direto e prático. Máximo 150 palavras."""
        
        response = ai_connector.get_ollama_response(prompt, stream=False)
        data = response.json()
        tips = data.get('message', {}).get('content', 'Dicas não disponíveis')
        
        return {"tips": tips}
    except Exception as e:
        return {"tips": "Erro ao gerar dicas. Tente novamente."}

@app.get("/unity/recreate-test-data")
def recreate_test_data():
    try:
        from datetime import datetime, timedelta
        
        # Criar perfil de teste
        test_profile = {
            "_id": "test_user_001",
            "dados_pessoais": {
                "nome": "João Silva",
                "idade": 45,
                "experiencia_anos": 20
            },
            "propriedade": {
                "nome": "Fazenda Boa Vista",
                "area_hectares": 50.5,
                "cultivo_principal": "Milho",
                "localizacao": {"latitude": -22.25, "longitude": -45.70}
            },
            "created_at": datetime.now()
        }
        unity_profiles.update_one({"_id": "test_user_001"}, {"$set": test_profile}, upsert=True)
        
        # Criar dados de solo de teste
        test_soil = {
            "unity_id": "test_user_001",
            "timestamp": datetime.now(),
            "soil_parameters": {
                "ph": 6.5,
                "umidade": 55.0,
                "temperatura": 25.0,
                "condutividade": 1.2,
                "salinidade": 0.3
            },
            "nutrients": {
                "nitrogenio": 180.0,
                "fosforo": 140.0,
                "potassio": 200.0
            },
            "cultivo_atual": "Milho",
            "game_metrics": {
                "score": 850,
                "sustainability_index": 75,
                "soil_health": 80
            }
        }
        unity_soil_data.insert_one(test_soil)
        
        return {"status": "success", "message": "Dados de teste criados com sucesso"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    print("EKKO API - MongoDB Atlas")
    print(f"Banco: {DB_NAME}")
    print("Porta: 8002")
    print("Docs: http://127.0.0.1:8002/docs")
    print("Status: http://127.0.0.1:8002/unity/status")
    print("=" * 50)
    
    uvicorn.run(app, host=API_HOST, port=API_PORT, reload=API_DEBUG)