"""
Script para criar o perfil universal clienteekko3408
Estrutura idêntica aos perfis gerados com faker
"""

from datetime import datetime
from database import unity_profiles, unity_soil_data
import random

def create_universal_client():
    """Cria o perfil universal clienteekko3408"""
    
    unity_id = "clienteekko3408"
    
    # Verificar se já existe
    existing = unity_profiles.find_one({"_id": unity_id})
    if existing:
        print(f"ERRO: Perfil {unity_id} ja existe no banco!")
        return False
    
    # Perfil completo seguindo a estrutura padrão
    profile_doc = {
        "_id": unity_id,
        "dados_pessoais": {
            "nome": "Cliente Universal EKKO",
            "email": "cliente@ekko3408.com.br",
            "telefone": "(35) 99999-3408",
            "cpf": "000.000.000-00",
            "data_nascimento": "1990-01-01",
            "genero": "Não informado"
        },
        "propriedade": {
            "nome": "Fazenda Demonstração EKKO",
            "area_hectares": 100.0,
            "localizacao": "Santa Rita do Sapucaí, MG",
            "regiao": "Sul de Minas Gerais",
            "tipo_solo": "Latossolo Vermelho-Amarelo",
            "irrigacao_disponivel": True,
            "cultivos_principais": ["Café", "Milho", "Feijão"],
            "certificacoes": ["Boas Práticas Agrícolas", "Sustentável"]
        },
        "experiencia": {
            "anos_agricultura": 15,
            "nivel_tecnologia": "Avançado",
            "uso_defensivos": "Moderado",
            "conhecimento_solo": "Alto",
            "interesse_sustentabilidade": "Alto"
        },
        "unity_stats": {
            "total_sessions": 25,
            "best_score": 850,
            "total_playtime": 1800,  # 30 horas em segundos
            "nivel": "Especialista",
            "achievements": [
                "Primeiro Login",
                "Solo Perfeito",
                "Eco Warrior",
                "Master Farmer",
                "Sustentável Pro"
            ]
        },
        "auditoria": {
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "login_count": 50,
            "status": "active"
        }
    }
    
    # Inserir no banco
    try:
        unity_profiles.insert_one(profile_doc)
        print(f"SUCESSO: Perfil {unity_id} criado com sucesso!")
        
        # Criar alguns dados de solo de exemplo
        create_sample_soil_data(unity_id)
        
        return True
        
    except Exception as e:
        print(f"ERRO: Erro ao criar perfil: {e}")
        return False

def create_sample_soil_data(unity_id):
    """Cria dados de solo de exemplo para o cliente universal"""
    
    print("Criando dados de solo de exemplo...")
    
    # Gerar 5 registros de solo com valores realistas
    for i in range(5):
        timestamp_offset = i * 3600  # 1 hora entre cada registro
        
        soil_doc = {
            "_id": f"soil_{unity_id}_{int(datetime.utcnow().timestamp()) - timestamp_offset}",
            "unity_id": unity_id,
            "timestamp": datetime.utcnow(),
            "soil_parameters": {
                "ph": round(random.uniform(4.2, 6.8), 2),
                "umidade": round(random.uniform(45, 65), 2),
                "temperatura": round(random.uniform(22, 28), 2),
                "salinidade": round(random.uniform(300, 600), 2),
                "condutividade": round(random.uniform(0.8, 1.4), 2),
                "densidade": round(random.uniform(1.1, 1.3), 2),
                "materia_organica": round(random.uniform(3.0, 4.5), 2)
            },
            "nutrients": {
                "nitrogenio": round(random.uniform(40, 80), 2),
                "fosforo": round(random.uniform(20, 40), 2),
                "potassio": round(random.uniform(120, 200), 2),
                "calcio": round(random.uniform(400, 600), 2),
                "magnesio": round(random.uniform(100, 150), 2),
                "enxofre": round(random.uniform(15, 25), 2)
            },
            "player_actions": {
                "irrigacao": round(random.uniform(50, 80), 2),
                "fertilizante_npk": {
                    "N": round(random.uniform(20, 40), 2),
                    "P": round(random.uniform(10, 20), 2),
                    "K": round(random.uniform(30, 50), 2)
                },
                "calagem": round(random.uniform(0.3, 0.8), 2),
                "materia_organica_adicionada": round(random.uniform(0.8, 1.5), 2)
            },
            "game_metrics": {
                "score": random.randint(700, 900),
                "money_spent": round(random.uniform(150, 300), 2),
                "sustainability_index": round(random.uniform(0.7, 0.95), 2),
                "productivity_estimate": random.randint(60, 90)
            },
            "cultivo_atual": random.choice(["Café", "Milho", "Feijão"]),
            "estacao": random.choice(["Plantio", "Crescimento", "Floração", "Colheita"]),
            "health_score": random.randint(75, 95)
        }
        
        unity_soil_data.insert_one(soil_doc)
    
    print(f"SUCESSO: {5} registros de solo criados!")

def verify_client():
    """Verifica se o cliente foi criado corretamente"""
    
    unity_id = "clienteekko3408"
    
    # Verificar perfil
    profile = unity_profiles.find_one({"_id": unity_id})
    if not profile:
        print(f"ERRO: Perfil {unity_id} nao encontrado!")
        return False
    
    # Verificar dados de solo
    soil_count = unity_soil_data.count_documents({"unity_id": unity_id})
    
    print(f"\nVERIFICACAO DO CLIENTE UNIVERSAL:")
    print(f"Unity ID: {unity_id}")
    print(f"Nome: {profile['dados_pessoais']['nome']}")
    print(f"Propriedade: {profile['propriedade']['nome']}")
    print(f"Localizacao: {profile['propriedade']['localizacao']}")
    print(f"Area: {profile['propriedade']['area_hectares']} hectares")
    print(f"Sessoes Unity: {profile['unity_stats']['total_sessions']}")
    print(f"Melhor Score: {profile['unity_stats']['best_score']}")
    print(f"Registros de Solo: {soil_count}")
    print(f"Status: {profile['auditoria']['status']}")
    
    return True

if __name__ == "__main__":
    print("CRIANDO CLIENTE UNIVERSAL EKKO")
    print("=" * 50)
    
    # Criar o cliente
    success = create_universal_client()
    
    if success:
        print("\nVERIFICANDO CRIACAO...")
        verify_client()
        
        print(f"\nCOMO USAR:")
        print(f"1. Acesse: http://localhost:8002/unity/login/clienteekko3408")
        print(f"2. Ou use no dashboard: ?unityId=clienteekko3408")
        print(f"3. Teste a API: http://localhost:8002/unity/dashboard/clienteekko3408")
        
    print("\n" + "=" * 50)