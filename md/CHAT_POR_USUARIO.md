# 🔒 Chat por Usuário - Isolamento de Sessões

Sistema de isolamento de conversas por Unity ID no chatbot EKKO.

## 🎯 Objetivo

Garantir que cada usuário tenha conversas isoladas e contextualizadas com base em seus dados específicos de solo e perfil.

## 🏗️ Arquitetura

### Identificação Única
- **Unity ID**: Identificador único do usuário na simulação
- **Sessões Isoladas**: Cada usuário mantém histórico separado
- **Contexto Personalizado**: RAG baseado nos dados específicos do usuário

### Fluxo de Dados
```
Unity Game → Unity ID → Backend → MongoDB → Contexto Específico → Llama 3.2
```

## 🔧 Implementação

### Endpoint Principal
```
POST /api/chat/{unity_id}
```

### Contexto por Usuário
1. **Dados de Solo**: pH, NPK, umidade específicos
2. **Histórico**: Conversas anteriores do usuário
3. **Perfil**: Localização, culturas, preferências
4. **Análises**: Resultados de IA específicos

### Isolamento de Dados
- Cada Unity ID acessa apenas seus próprios dados
- Histórico de chat separado por usuário
- Recomendações personalizadas baseadas no perfil

## 📊 Collections MongoDB

### `users` Collection
```json
{
  "_id": "unity_id_123",
  "profile": {...},
  "soil_data": {...},
  "chat_history": [...]
}
```

### `chat_sessions` Collection
```json
{
  "unity_id": "unity_id_123",
  "messages": [...],
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🚀 Benefícios

- **Privacidade**: Dados isolados por usuário
- **Personalização**: Respostas contextualizadas
- **Escalabilidade**: Suporte a múltiplos usuários simultâneos
- **Consistência**: Histórico mantido por sessão