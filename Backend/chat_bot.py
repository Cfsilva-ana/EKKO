import os
import json
import re
import requests
from flask import Flask, request, Response
from flask_cors import CORS
from dotenv import load_dotenv

import tools
import prompts

# --- CONFIGURAÇÃO E INICIALIZAÇÃO ---
app = Flask(__name__)
CORS(app)

# OLLAMA API URL - Cérebro 100% Local
OLLAMA_API_URL = "http://localhost:11434/api/generate"

AVAILABLE_TOOLS = {
    "save_memory": tools.save_memory,
    "focused_web_search": tools.focused_web_search,
    "get_inmet_forecast": tools.get_inmet_forecast,
    "local_database_search": tools.local_database_search
}

# --- CÉREBRO DO AGENTE ---
@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    coordinates = request.json.get('coordinates')
    history = request.json.get('history', [])
    formatted_history = "\n".join(history)
    if not user_message: return Response(status=400)

    location_string = tools.get_location_name(lat=coordinates['latitude'], lon=coordinates['longitude']) if coordinates else ""
    
    def stream_generation():
        plan = {}
        tool_result = ""
        try:
            # ETAPA 1: PLANEJAMENTO
            planner_prompt_content = prompts.PLANNER_PROMPT.format(user_message=user_message)
            
            # Formato de prompt específico para Llama 3
            full_planner_prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nVocê é um planejador de IA. Sua única tarefa é retornar um JSON.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{planner_prompt_content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
            payload = {"model": "llama3", "prompt": full_planner_prompt, "stream": False, "format": "json"}
            
            planner_response = requests.post(OLLAMA_API_URL, json=payload)
            planner_response.raise_for_status()
            
            plan_str = planner_response.json().get("response", "{}")
            plan = json.loads(plan_str)
            
            tool_name = plan.get("tool_name")
            parameters = plan.get("parameters") or {}
            
            # ETAPA 2: EXECUÇÃO
            if tool_name in AVAILABLE_TOOLS:
                status_message = f"Consultando a ferramenta: {tool_name}..."
                yield f'data: {json.dumps({"type": "status", "message": status_message})}\n\n'
                
                tool_function = AVAILABLE_TOOLS[tool_name]
                
                if tool_name == 'get_inmet_forecast':
                    tool_result = tool_function(lat=coordinates['latitude'], lon=coordinates['longitude']) if coordinates else "Instrução: Ative a localização para obter a previsão do tempo."
                elif tool_name == 'focused_web_search':
                    tool_result = tool_function(query=parameters.get("query", user_message), location_string=location_string)
                else:
                    tool_result = tool_function(**parameters)
            else:
                tool_result = "Olá! Sou Ekko. Como posso ser útil hoje?"

            if tool_name in ["save_memory", "answer_directly"] or (tool_name == "get_inmet_forecast" and not coordinates):
                yield f'data: {json.dumps({"type": "chunk", "message": tool_result})}\n\n'
                return

        except Exception as e:
            print(f"!!! ERRO no ciclo de Agente: {e}")
            tool_result = f"Ocorreu um erro no meu raciocínio. Detalhe: {str(e)}"

        # ETAPA 3: SÍNTESE
        long_term_memory = tools.recall_memories()
        synthesizer_prompt_content = prompts.SYNTHESIZER_PROMPT.format(
            long_term_memory=long_term_memory, user_message=user_message, tool_result=tool_result
        )
        
        full_synthesizer_prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nVocê é Ekko, um assistente IA especialista em agricultura.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{synthesizer_prompt_content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
        payload = {"model": "llama3", "prompt": full_synthesizer_prompt, "stream": True}
        
        try:
            response = requests.post(OLLAMA_API_URL, json=payload, stream=True)
            response.raise_for_status()
            for chunk in response.iter_lines():
                if chunk:
                    json_chunk = json.loads(chunk)
                    yield f'data: {json.dumps({"type": "chunk", "message": json_chunk.get("response", "")})}\n\n'
        except Exception as e:
            print(f"!!! ERRO no sintetizador Ollama: {e}")
            yield f'data: {json.dumps({"type": "chunk", "message": "Ops, erro de comunicação com a IA local (Ollama)."})}\n\n'

    return Response(stream_generation(), mimetype='text/event-stream')

if __name__ == '__main__':
    tools.init_memory_db()
    tools.load_inmet_stations()
    tools.load_and_index_local_database()
    print("Servidor Ekko iniciado.")
    app.run(host='0.0.0.0', port=5000, debug=False)