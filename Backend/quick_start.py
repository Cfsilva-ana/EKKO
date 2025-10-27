# -*- coding: utf-8 -*-
import subprocess
import sys
import time

def start_server():
    print("=== EKKO - Início Rápido ===")
    print("1. Verificando Ollama...")
    
    # Verificar Ollama
    try:
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=5)
        if 'llama3.2' in result.stdout:
            print("OK - Ollama e llama3.2 funcionando")
        else:
            print("ERRO - Modelo llama3.2 nao encontrado")
            return
    except:
        print("ERRO - Ollama nao esta rodando")
        return
    
    print("2. Iniciando servidor EKKO...")
    
    # Iniciar servidor
    try:
        subprocess.run([sys.executable, 'main.py'], check=True)
    except KeyboardInterrupt:
        print("\nServidor parado pelo usuário")
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    start_server()