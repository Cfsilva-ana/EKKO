"""
Sistema de IA - EKKO 
Análise completa de solo com 9 parâmetros
"""

import logging
from typing import Dict, List, Optional
from constants import SOIL_RANGES, STATUS_IDEAL, STATUS_ATENCAO, STATUS_CRITICO, MESSAGES

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_soil_complete(latest_soil, soil_history, profile):
    """Análise completa de solo com IA avançada"""
    logger.info(f"Iniciando análise de solo para perfil: {profile.get('_id', 'N/A')}")
    
    if not latest_soil:
        logger.warning("Nenhum dado de solo encontrado")
        return get_default_analysis()
    
    # Extrair dados
    soil_params = latest_soil.get("soil_parameters", {})
    nutrients = latest_soil.get("nutrients", {})
    game_metrics = latest_soil.get("game_metrics", {})
    player_actions = latest_soil.get("player_actions", {})
    
    # Analisar todos os parâmetros
    parametros = analyze_all_parameters(soil_params, nutrients, game_metrics)
    
    # Identificar alertas críticos
    alertas_criticos = get_critical_alerts(parametros)
    
    # Calcular saúde geral
    saude_geral = calculate_overall_health(parametros)
    
    # Gerar recomendações
    recomendacoes = generate_recommendations(parametros, profile, soil_history)
    
    logger.info(f"Análise concluída - Saúde geral: {saude_geral:.1f}%")
    
    return {
        "saude_geral": saude_geral,
        "alertas_criticos": alertas_criticos,
        "parametros": parametros,
        "recomendacao_geral": recomendacoes["geral"],
        "acoes_prioritarias": recomendacoes["acoes"],
        "previsao_colheita": predict_harvest(parametros, profile),
        "economia_estimada": calculate_savings(player_actions, parametros)
    }

def analyze_all_parameters(soil_params, nutrients, game_metrics):
    """Analisa todos os parâmetros de solo"""
    parametros = {}
    
    # Parâmetros básicos do solo
    parametros["ph"] = analyze_parameter("ph", soil_params.get("ph", 7.0))
    parametros["umidade"] = analyze_parameter("umidade", soil_params.get("umidade", 50))
    parametros["temperatura"] = analyze_parameter("temperatura", soil_params.get("temperatura", 25))
    parametros["salinidade"] = analyze_parameter("salinidade", soil_params.get("salinidade", 400))
    parametros["condutividade"] = analyze_parameter("condutividade", soil_params.get("condutividade", 1.2))
    
    # Nutrientes
    parametros["nitrogenio"] = analyze_parameter("nitrogenio", nutrients.get("nitrogenio", 50))
    parametros["fosforo"] = analyze_parameter("fosforo", nutrients.get("fosforo", 25))
    parametros["potassio"] = analyze_parameter("potassio", nutrients.get("potassio", 150))
    
    # Performance do jogo
    parametros["performance"] = analyze_parameter("performance", game_metrics.get("score", 0))
    
    return parametros

def analyze_parameter(param_name, value):
    """Análise genérica de parâmetros usando constantes"""
    if param_name not in SOIL_RANGES:
        return create_default_analysis(param_name, value)
    
    ranges = SOIL_RANGES[param_name]
    status = determine_status(param_name, value, ranges)
    
    return {
        "valor": value,
        "faixa_ideal": get_ideal_range_text(ranges),
        "status": status,
        "impacto": MESSAGES.get(param_name, {}).get(status, "Análise não disponível"),
        "sugestao": get_suggestion(param_name, value, status)
    }

def determine_status(param_name, value, ranges):
    """Determina o status baseado nas faixas"""
    if param_name in ["salinidade", "condutividade"]:
        # Parâmetros que só têm máximo
        max_val = ranges["max"]
        if value <= max_val:
            return STATUS_IDEAL
        elif value <= max_val * 1.5:
            return STATUS_ATENCAO
        else:
            return STATUS_CRITICO
    elif param_name == "performance":
        # Performance tem só mínimo
        min_val = ranges["min"]
        if value >= min_val:
            return STATUS_IDEAL
        elif value >= min_val * 0.6:
            return STATUS_ATENCAO
        else:
            return STATUS_CRITICO
    else:
        # Parâmetros com faixa min-max
        min_val, max_val = ranges["min"], ranges["max"]
        if min_val <= value <= max_val:
            return STATUS_IDEAL
        elif (min_val * 0.8) <= value <= (max_val * 1.2):
            return STATUS_ATENCAO
        else:
            return STATUS_CRITICO

def get_ideal_range_text(ranges):
    """Gera texto da faixa ideal"""
    if "min" in ranges and "max" in ranges:
        return f"{ranges['min']}-{ranges['max']}"
    elif "max" in ranges:
        return f"< {ranges['max']}"
    elif "min" in ranges:
        return f"> {ranges['min']}"
    return "N/A"

def get_suggestion(param_name, value, status):
    """Gera sugestões baseadas no parâmetro e status"""
    suggestions = {
        "ph": {
            STATUS_IDEAL: "Manter pH atual com monitoramento regular",
            STATUS_ATENCAO: "Aplicar calcário" if value < 6.0 else "Aplicar enxofre",
            STATUS_CRITICO: "Correção urgente de pH necessária"
        },
        "umidade": {
            STATUS_IDEAL: "Manter irrigação atual",
            STATUS_ATENCAO: "Ajustar irrigação" if value < 40 else "Reduzir irrigação",
            STATUS_CRITICO: "Correção urgente da irrigação"
        },
        "temperatura": {
            STATUS_IDEAL: "Condições térmicas adequadas",
            STATUS_ATENCAO: "Monitorar cobertura do solo",
            STATUS_CRITICO: "Implementar sombreamento ou cobertura"
        },
        "salinidade": {
            STATUS_IDEAL: "Manter práticas atuais",
            STATUS_ATENCAO: "Aumentar lixiviação com irrigação",
            STATUS_CRITICO: "Drenagem urgente e lixiviação intensiva"
        },
        "condutividade": {
            STATUS_IDEAL: "Manter práticas atuais de irrigação",
            STATUS_ATENCAO: "Melhorar drenagem e qualidade da água",
            STATUS_CRITICO: "Lixiviação urgente e correção do solo"
        },
        "performance": {
            STATUS_IDEAL: "Continue com as estratégias atuais",
            STATUS_ATENCAO: "Otimize o uso de recursos",
            STATUS_CRITICO: "Revise estratégias de manejo"
        }
    }
    
    # Sugestões para nutrientes
    if param_name in ["nitrogenio", "fosforo", "potassio"]:
        nutrient_map = {"nitrogenio": "N", "fosforo": "P", "potassio": "K"}
        nutrient = nutrient_map[param_name]
        
        if status == STATUS_IDEAL:
            return "Manter adubação atual"
        elif status == STATUS_ATENCAO:
            ranges = SOIL_RANGES[param_name]
            if value < ranges["min"]:
                return f"Aplicar fertilizante rico em {nutrient}"
            else:
                return f"Reduzir adubação com {nutrient}"
        else:
            return f"Correção urgente de {nutrient}"
    
    return suggestions.get(param_name, {}).get(status, "Monitorar parâmetro")

def get_critical_alerts(parametros):
    """Identifica alertas críticos"""
    alertas = []
    for nome, param in parametros.items():
        if param["status"] == STATUS_CRITICO:
            valor = param["valor"]
            unit = SOIL_RANGES.get(nome, {}).get("unit", "")
            alertas.append(f"{SOIL_RANGES[nome]['name']} crítico: {valor}{unit}")
    return alertas



def calculate_overall_health(parametros):
    """Calcula saúde geral baseada nos parâmetros"""
    scores = []
    for param in parametros.values():
        if param["status"] == STATUS_IDEAL:
            scores.append(100)
        elif param["status"] == STATUS_ATENCAO:
            scores.append(70)
        else:
            scores.append(30)
    return sum(scores) / len(scores) if scores else 50

def generate_recommendations(parametros, profile, history):
    """Gera recomendações personalizadas"""
    acoes = []
    
    # Ações baseadas em parâmetros críticos
    for nome, param in parametros.items():
        if param["status"] == STATUS_CRITICO:
            acoes.append(f"🚨 {param['sugestao']} ({nome})")
    
    # Ações baseadas no perfil
    regiao = profile.get("propriedade", {}).get("regiao", "")
    if "Sul de Minas" in regiao:
        acoes.append("☕ Considere plantio de café na próxima safra")
    
    geral = "Solo necessita atenção em múltiplos parâmetros" if len(acoes) > 2 else "Solo em condições adequadas"
    
    return {"geral": geral, "acoes": acoes[:5]}

def predict_harvest(parametros, profile):
    """Predição de colheita baseada na saúde do solo"""
    health_score = calculate_overall_health(parametros)
    area = profile.get("propriedade", {}).get("area_hectares", 50)
    
    if health_score > 80:
        return f"Produtividade estimada: {area * 8.5:.1f} toneladas (Excelente)"
    elif health_score > 60:
        return f"Produtividade estimada: {area * 6.2:.1f} toneladas (Boa)"
    else:
        return f"Produtividade estimada: {area * 4.1:.1f} toneladas (Baixa)"

def calculate_savings(actions, parametros):
    """Calcula economia estimada"""
    money_spent = actions.get("money_spent", 0)
    health_score = calculate_overall_health(parametros)
    
    if health_score > 80:
        savings = money_spent * 0.15
        return f"Economia potencial: R$ {savings:.2f} (Manejo eficiente)"
    else:
        extra_cost = money_spent * 0.25
        return f"Custo adicional estimado: R$ {extra_cost:.2f} (Correções necessárias)"

def get_default_analysis():
    """Análise padrão quando não há dados"""
    return {
        "saude_geral": 50,
        "alertas_criticos": ["Sem dados de solo disponíveis"],
        "parametros": {},
        "recomendacao_geral": "Inicie o monitoramento do solo",
        "acoes_prioritarias": ["📊 Colete dados de solo"],
        "previsao_colheita": "Dados insuficientes",
        "economia_estimada": "Análise indisponível"
    }

def get_main_crop(profile):
    """Obtém cultivo principal do perfil"""
    cultivos = profile.get("propriedade", {}).get("cultivos_principais", [])
    return cultivos[0] if cultivos else "Cultivo Geral"

def count_ideal_parameters(parametros):
    """Conta parâmetros em estado ideal"""
    return sum(1 for p in parametros.values() if p["status"] == STATUS_IDEAL)

def analyze_trend(history):
    """Analisa tendência baseada no histórico"""
    if len(history) < 3:
        return "Dados insuficientes"
    
    scores = [h.get("game_metrics", {}).get("score", 0) for h in history[:3]]
    if scores[0] > scores[-1]:
        return "Melhorando"
    elif scores[0] < scores[-1]:
        return "Declinando"
    else:
        return "Estável"

def calculate_sustainability(soil_data, profile):
    """Calcula nível de sustentabilidade"""
    if not soil_data:
        return 50
    
    score = 60  # Base
    
    actions = soil_data.get("player_actions", {})
    if actions.get("irrigacao", 0) < 80:
        score += 20
    
    npk = actions.get("fertilizante_npk", {})
    total_npk = sum(npk.values()) if npk else 0
    if total_npk < 100:
        score += 20
    
    return min(score, 100)

def calculate_soil_health(soil_data: Optional[Dict]) -> float:
    """Calcula saúde do solo para dashboard"""
    if not soil_data:
        return 50.0
    
    soil_params = soil_data.get("soil_parameters", {})
    score = 0
    
    # pH
    ph = soil_params.get("ph", 7.0)
    if 6.0 <= ph <= 7.0:
        score += 25
    elif 5.5 <= ph <= 7.5:
        score += 15
    
    # Umidade
    umidade = soil_params.get("umidade", 50)
    if 40 <= umidade <= 60:
        score += 25
    elif 30 <= umidade <= 70:
        score += 15
    
    # Salinidade
    salinidade = soil_params.get("salinidade", 500)
    if salinidade < 800:
        score += 25
    elif salinidade < 1200:
        score += 15
    
    # Nutrientes
    nutrients = soil_data.get("nutrients", {})
    n = nutrients.get("nitrogenio", 50)
    p = nutrients.get("fosforo", 25)
    k = nutrients.get("potassio", 150)
    
    if 20 <= n <= 100:
        score += 8
    if 15 <= p <= 50:
        score += 8
    if 100 <= k <= 250:
        score += 9
    
    return min(score, 100)