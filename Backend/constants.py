"""
Constantes do Sistema EKKO 
Faixas ideais e configurações
"""

# Faixas ideais dos parâmetros de solo
SOIL_RANGES = {
    "ph": {"min": 6.0, "max": 7.0, "unit": "", "name": "pH do Solo"},
    "umidade": {"min": 40, "max": 70, "unit": "%", "name": "Umidade"},
    "temperatura": {"min": 20, "max": 30, "unit": "°C", "name": "Temperatura"},
    "salinidade": {"max": 600, "unit": " ppm", "name": "Salinidade"},
    "condutividade": {"max": 1.5, "unit": " dS/m", "name": "Condutividade"},
    "nitrogenio": {"min": 20, "max": 100, "unit": " mg/kg", "name": "Nitrogênio (N)"},
    "fosforo": {"min": 15, "max": 50, "unit": " mg/kg", "name": "Fósforo (P)"},
    "potassio": {"min": 100, "max": 250, "unit": " mg/kg", "name": "Potássio (K)"},
    "performance": {"min": 800, "unit": " pts", "name": "Performance Unity"}
}

# Status de análise
STATUS_IDEAL = "ideal"
STATUS_ATENCAO = "atencao"
STATUS_CRITICO = "critico"

# Mensagens padrão
MESSAGES = {
    "ph": {
        STATUS_IDEAL: "pH ideal para absorção de nutrientes",
        STATUS_ATENCAO: "Absorção de nutrientes pode ser reduzida",
        STATUS_CRITICO: "Bloqueio severo de nutrientes"
    },
    "umidade": {
        STATUS_IDEAL: "Umidade adequada para desenvolvimento",
        STATUS_ATENCAO: "Estresse hídrico moderado",
        STATUS_CRITICO: "Estresse hídrico severo"
    },
    "temperatura": {
        STATUS_IDEAL: "Temperatura ideal para crescimento",
        STATUS_ATENCAO: "Crescimento pode ser afetado",
        STATUS_CRITICO: "Estresse térmico severo"
    },
    "salinidade": {
        STATUS_IDEAL: "Salinidade não limitante",
        STATUS_ATENCAO: "Início de estresse salino",
        STATUS_CRITICO: "Toxicidade por sal"
    },
    "condutividade": {
        STATUS_IDEAL: "Condutividade adequada para cultivos",
        STATUS_ATENCAO: "Início de estresse salino",
        STATUS_CRITICO: "Solo salino - prejudica absorção"
    }
}