"""
Monitor Simples - EKKO Unity
Versão simplificada para monitoramento básico
"""

import os
import time
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

# MongoDB Atlas
MONGO_URI = os.getenv("UNITY_MONGO_URI")
DB_NAME = os.getenv("UNITY_MONGO_DB_NAME", "EKKOnUnity")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collection de dados de solo
unity_soil_data = db["Unity_soilData"]
print("Usando collection: Unity_soilData")

def monitor_simple():
    """Monitor simples que mostra apenas novos dados"""
    last_count = unity_soil_data.count_documents({})
    
    print(f"Monitorando banco: {DB_NAME}")
    print(f"Registros atuais: {last_count}")
    print("Aguardando novos dados da Unity...")
    print("(Ctrl+C para parar)")
    print("-" * 40)
    
    try:
        while True:
            time.sleep(2)  # Verifica a cada 2 segundos
            
            current_count = unity_soil_data.count_documents({})
            
            if current_count > last_count:
                new_records = current_count - last_count
                
                # Buscar dados mais recentes
                latest = unity_soil_data.find_one(sort=[("timestamp", -1)])
                
                print(f"\nNOVO DADO RECEBIDO! ({datetime.now().strftime('%H:%M:%S')})")
                print(f"Unity ID: {latest.get('unity_id', 'N/A')}")
                
                soil_params = latest.get('soil_parameters', {})
                print(f"pH: {soil_params.get('ph', 'N/A')} | Umidade: {soil_params.get('umidade', 'N/A')}%")
                
                game_metrics = latest.get('game_metrics', {})
                print(f"Score: {game_metrics.get('score', 'N/A')}")
                print("-" * 40)
                
                last_count = current_count
            else:
                print(".", end="", flush=True)
                
    except KeyboardInterrupt:
        print(f"\n\nMonitoramento finalizado.")
        print(f"Total final: {unity_soil_data.count_documents({})} registros")

if __name__ == "__main__":
    monitor_simple()