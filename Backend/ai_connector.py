import requests
import json

OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"

def test_ollama_connection():
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_ollama_response(prompt: str, stream: bool = False):
    if not test_ollama_connection():
        raise Exception("Ollama não está rodando! Execute: ollama serve")
    
    print(f"--- CONECTOR IA: Enviando para llama3.2 (Stream: {stream}) ---")
    
    payload = {
        "model": "llama3.2",
        "messages": [
            {"role": "system", "content": "Você é Ekko, assistente de agricultura."},
            {"role": "user", "content": prompt}
        ],
        "stream": stream,
        "options": {
            "num_predict": 500,
            "temperature": 0.7,
            "top_p": 0.9
        }
    }
    
    try:
        response = requests.post(OLLAMA_CHAT_URL, json=payload, stream=stream, timeout=30)
        response.raise_for_status()
        return response
    except Exception as e:
        print(f"ERRO Ollama: {e}")
        raise