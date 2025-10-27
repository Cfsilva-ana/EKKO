# Arquivo: tools.py

import sqlite3
import requests
import math
import json
import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from ddgs import DDGS
from datetime import datetime


try:
    print("-> Carregando modelo de embeddings para busca local...")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("-> Modelo de embeddings carregado com sucesso.")
except Exception as e:
    print(f"!!! ERRO ao carregar modelo de embeddings: {e}. A busca local estará desativada.")
    embedding_model = None

doc_path = "data/dados_plantacoes" 
documents = []
index = None

def load_and_index_local_database():

    global documents, index
    if not (os.path.exists(doc_path) and embedding_model):
        print("-> AVISO: Busca local desativada. Pasta 'dados_plantacoes' não encontrada ou vazia.")
        return

    print("-> Lendo e indexando a base de conhecimento local...")
    for root, _, files in os.walk(doc_path):
        for filename in files:
            if filename.endswith(".txt"):
                filepath = os.path.join(root, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    documents.append(f.read())
    
    if documents:
        doc_embeddings = embedding_model.encode(documents)
        index = faiss.IndexFlatL2(doc_embeddings.shape[1])
        index.add(np.array(doc_embeddings, dtype=np.float32))
        print(f"-> Indexação de {len(documents)} documentos locais concluída!")


def local_database_search(query: str) -> str:
    """Ferramenta para buscar na base de conhecimento local (ficheiros .txt)."""
    print(f"--- Ferramenta Acionada: Busca na Base de Dados Local para '{query}' ---")
    if index is None or not documents:
        return "A base de dados local não está ativa ou está vazia."
    
    query_embedding = embedding_model.encode([query])
    # Busca os 3 trechos mais relevantes da biblioteca
    _, indices = index.search(np.array(query_embedding, dtype=np.float32), 3)
    
    context = "\n---\n".join([documents[i] for i in indices[0]])
    return f"Resultados da busca na base de dados local:\n{context}"

def save_memory(information: str) -> str:
    """Ferramenta para salvar um fato na memória de longo prazo (SQLite)."""
    print(f"--- Ferramenta Acionada: Gravar na Memória -> '{information}' ---")
    try:
        conn = sqlite3.connect("ekko_memory.db")
        cursor = conn.cursor()
        cursor.execute("INSERT OR IGNORE INTO memories (content) VALUES (?)", (information,))
        conn.commit()
        conn.close()
        return f"Anotado. A informação '{information}' foi guardada na minha memória."
    except Exception as e:
        return f"Erro ao tentar guardar a informação: {e}"

def recall_memories() -> str:
    """Função auxiliar para ler todas as memórias salvas."""
    try:
        conn = sqlite3.connect("ekko_memory.db")
        cursor = conn.cursor()
        cursor.execute("SELECT content FROM memories")
        memories = [row[0] for row in cursor.fetchall()]
        conn.close()
        if not memories: return "Nenhuma memória de longo prazo encontrada."
        return "Memórias de Longo Prazo (Fatos sobre o usuário):\n- " + "\n- ".join(memories)
    except Exception as e:
        return f"Erro ao aceder às memórias: {e}"

def focused_web_search(query: str, location_string: str = "") -> str:
    """Ferramenta para buscar na web, restrita a fontes confiáveis."""
    print(f"--- Ferramenta Acionada: Busca na Web -> '{query}' em '{location_string}' ---")
    trusted_sources = ["site:embrapa.br", "site:epamig.br", "site:noticiasagricolas.com.br", "site:canalrural.com.br", "site:globorural.globo.com", "site:cepea.esalq.usp.br"]
    full_query = f"{query} {location_string}"
    search_query = f"{full_query} ({' OR '.join(trusted_sources)})"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(search_query, region='br-pt', max_results=3))
        if not results: return "Nenhuma informação encontrada nas fontes confiáveis da web."
        context_web = "Resultados da busca em fontes confiáveis:\n"
        for result in results:
            context_web += f"- Trecho: '{result.get('body', '')}' [Fonte: {result.get('href', '')}]\n"
        return context_web
    except Exception as e:
        return f"Erro ao buscar na web: {e}"

# --- FERRAMENTAS DE CLIMA E LOCALIZAÇÃO ---
INMET_STATIONS = []
STATIONS_FILE = "data/estacoes_inmet.json"
def load_inmet_stations():
    """Carrega o 'mapa' de estações do INMET do ficheiro JSON local."""
    global INMET_STATIONS
    try:
        with open(STATIONS_FILE, 'r', encoding='utf-8') as f:
            INMET_STATIONS = json.load(f)
        print(f"-> {len(INMET_STATIONS)} estações do INMET carregadas.")
    except Exception as e:
        print(f"!!! ERRO ao carregar estações do INMET: {e}")

def find_closest_station(user_lat, user_lon):
    """Encontra a estação do INMET mais próxima usando a Fórmula de Haversine."""
    if not INMET_STATIONS: return None
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371
        dLat, dLon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
        a = math.sin(dLat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2)**2
        return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))
    return min(INMET_STATIONS, key=lambda s: haversine(user_lat, user_lon, float(s['VL_LATITUDE']), float(s['VL_LONGITUDE'])))

def get_inmet_forecast(lat: float, lon: float) -> str:
    """Ferramenta para obter a previsão do tempo oficial do INMET para uma localização."""
    print(f"--- Ferramenta Acionada: Previsão do Tempo INMET -> ({lat}, {lon}) ---")
    closest_station = find_closest_station(lat, lon)
    if not closest_station: return "Não foi possível encontrar a estação do INMET mais próxima."
    
    station_code, station_name = closest_station['CD_ESTACAO'], closest_station['DC_NOME']
    try:
        url = f"https://apitempo.inmet.gov.br/previsao/{station_code}"
        response = requests.get(url, timeout=10)
        data = response.json()
        city_data = data.get(station_code)
        if not city_data: return f"Não há previsão disponível no INMET para a estação {station_name}."

        forecast_text = f"Previsão do tempo para **{station_name}** (Estação INMET mais próxima):\n\n"
        days = sorted(list(city_data.keys()), key=lambda d: datetime.strptime(d, '%d/%m/%Y'))
        for day in days[:5]:
            day_data = city_data[day]
            date_str = datetime.strptime(day, '%d/%m/%Y').strftime('%d/%m (%a)')
            forecast_text += f"**{date_str}**: {day_data['resumo']}\n - Temp.: **{day_data['temp_min']}°C** / **{day_data['temp_max']}°C**\n"
        return forecast_text
    except Exception as e:
        return f"Erro ao obter a previsão do tempo do INMET: {e}"

def init_memory_db():
    """Cria a tabela de memória na base de dados se ela não existir."""
    conn = sqlite3.connect("data/ekko_memory.db")
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS memories (id INTEGER PRIMARY KEY, content TEXT NOT NULL UNIQUE)')
    conn.commit()
    conn.close()
    print("-> Base de dados de memória iniciada.")

def get_location_name(lat: float, lon: float) -> str:
    """Ferramenta para converter coordenadas em nome de local (cidade, estado)."""
    print(f"--- Ferramenta Acionada: Geocodificação Reversa -> ({lat}, {lon}) ---")
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
        headers = {'User-Agent': 'EkkoเกษตรกรAssistant/1.0'}
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        address = data.get('address', {})
        city = address.get('city') or address.get('town') or address.get('village') or address.get('municipality')
        state = address.get('state')
        return f"{city}, {state}" if city and state else ""
    except Exception as e:
        print(f"ERRO na geocodificação reversa: {e}")
        return ""
    

    