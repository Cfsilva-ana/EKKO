# -*- coding: utf-8 -*-
from database import unity_profiles, unity_soil_data

unity_id = "unity_bf87c29494e0"

print(f"Verificando dados para: {unity_id}\n")

# Verificar perfil
profile = unity_profiles.find_one({"_id": unity_id})
if profile:
    print("OK - PERFIL ENCONTRADO:")
    print(f"  Nome: {profile.get('dados_pessoais', {}).get('nome', 'N/A')}")
    print(f"  Propriedade: {profile.get('propriedade', {}).get('nome', 'N/A')}")
    print(f"  Area: {profile.get('propriedade', {}).get('area_hectares', 0)} ha")
else:
    print("ERRO - Perfil NAO encontrado")

# Verificar dados de solo
soil_count = unity_soil_data.count_documents({"unity_id": unity_id})
print(f"\nOK - DADOS DE SOLO: {soil_count} registros")

if soil_count > 0:
    latest = unity_soil_data.find_one({"unity_id": unity_id}, sort=[("timestamp", -1)])
    print(f"  pH: {latest.get('soil_parameters', {}).get('ph', 'N/A')}")
    print(f"  Umidade: {latest.get('soil_parameters', {}).get('umidade', 'N/A')}%")
    print(f"  Cultivo: {latest.get('cultivo_atual', 'N/A')}")
else:
    print("  AVISO - Nenhum dado de solo encontrado!")
    print("\n  Execute: py criar_dados_teste.py")
