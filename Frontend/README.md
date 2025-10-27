# 🎨 EKKO - Frontend Dashboard

Interface web moderna para visualização dos dados da simulação Unity.

## 📁 Estrutura Limpa

```
Frontend/
├── pages/
│   ├── index.html         # Homepage
│   ├── login.html         # Login por Unity ID  
│   └── dashboard.html     # Dashboard principal
├── css/
│   ├── index.css          # Estilos homepage
│   ├── login.css          # Estilos login
│   └── dashboard.css      # Estilos dashboard
├── js/
│   ├── index.js           # Lógica homepage
│   └── unity-dashboard.js # JavaScript dashboard
└── assets/images/
    └── Fundo_menu.png     # Background
```

## 🚀 Como Usar

### 1. Iniciar Backend
```bash
cd ../Backend
python main.py
```

### 2. Abrir Frontend
Abrir `pages/index.html` no navegador

### 3. Fluxo
1. **Homepage** → Apresentação
2. **Login** → Digite Unity ID
3. **Dashboard** → Visualização completa

## 📊 Seções Dashboard

- 🏠 **Início** - Métricas em tempo real
- 👤 **Perfil** - Dados completos
- 🧠 **IA & Solo** - Análise 9 parâmetros
- 📈 **Estatísticas** - Mapas de calor
- 🎮 **Unity** - Histórico sessões
- 💻 **Desenvolvimento** - Documentação
- 📡 **Monitoramento** - Sistema futuro

## 🔧 Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Glassmorphism moderno
- **JavaScript** - Vanilla ES6+
- **Chart.js** - Gráficos interativos
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia

## 🎯 Funcionalidades

- ✅ Login por Unity ID
- ✅ Dashboard completo (7 seções)
- ✅ Análise IA visual
- ✅ Mapas de calor interativos
- ✅ Design responsivo
- ✅ Navegação fluida
- ✅ Error handling
- ✅ Loading states

## 🌐 API Integration

**Base**: `http://127.0.0.1:8002`

**Endpoints**:
- `/unity/login/{user_id}` - Login
- `/unity/dashboard/{user_id}` - Dados
- `/unity/analise-ia/{user_id}` - IA

---

**EKKO Frontend** - Interface limpa e otimizada 🎯