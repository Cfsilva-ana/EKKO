"""
Configuração do Banco de Dados - EKKO
MongoDB Atlas
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

# MongoDB Atlas - Configuração via variáveis de ambiente
MONGO_URI = os.getenv("UNITY_MONGO_URI")
DB_NAME = os.getenv("UNITY_MONGO_DB_NAME", "EKKOnUnity")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8002"))
API_DEBUG = os.getenv("API_DEBUG", "False").lower() == "true"

if not MONGO_URI:
    raise ValueError("MONGO_URI não configurada. Configure o arquivo .env")

# Conexão MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
unity_profiles = db["Python_userData"]
unity_soil_data = db["Unity_soilData"]