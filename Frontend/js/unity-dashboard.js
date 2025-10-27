//Dashboard JavaScript 
const UnityDashboard = {
    baseUrl: `http://${window.location.hostname}:8002`,
    currentUnityId: null,
    currentUserData: null,

    // Inicialização
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuthentication();
        });
    },

    // Autenticação 
    checkAuthentication() {
        const urlParams = new URLSearchParams(window.location.search);
        const unityIdParam = urlParams.get('unityId');
        const storedUnityId = localStorage.getItem('unityId');
        
        if (unityIdParam) {
            this.currentUnityId = unityIdParam;
            localStorage.setItem('unityId', unityIdParam);
            localStorage.setItem('unity_id', unityIdParam); // Para compatibilidade com monitoramento
            sessionStorage.setItem('unity_id', unityIdParam); // Para sessão
            window.currentUnityId = unityIdParam; // Global para módulos
            setTimeout(() => this.loadUnityProfile(unityIdParam), 500);
        } else if (storedUnityId) {
            this.currentUnityId = storedUnityId;
            localStorage.setItem('unity_id', storedUnityId); // Para compatibilidade com monitoramento
            sessionStorage.setItem('unity_id', storedUnityId); // Para sessão
            window.currentUnityId = storedUnityId; // Global para módulos
            setTimeout(() => this.loadUnityProfile(storedUnityId), 500);
        } else {
            window.location.href = 'login.html';
        }
    },

    // Logout 
    logout() {
        localStorage.removeItem('unityId');
        localStorage.removeItem('unityUser');
        window.location.href = 'login.html';
    },

    // Carregar perfil
    async loadUnityProfile(unityId) {
        if (!unityId) return;

        this.showLoading('dashboard-content', 'Carregando seus dados...');
        this.showLoading('profile-content', 'Carregando perfil...');
        this.showLoading('ai-content', 'Carregando análises de IA...');
        this.showLoading('heatmap-content', 'Carregando estatísticas...');
        this.showLoading('readings-content', 'Carregando dados da simulação...');
        this.showLoading('monitoring-content', 'Carregando monitoramento...');

        try {
            // Adicionar timestamp para evitar cache
            const timestamp = new Date().getTime();
            const response = await fetch(`${this.baseUrl}/unity/dashboard/${unityId}?t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.profile) {
                throw new Error('Dados são inválidos.');
            }

            this.currentUserData = data;
            
            this.loadDashboardContent(data);
            this.loadProfileContent(data);
            this.loadReadingsContent(data);
            this.loadHeatmapContent(data);
            this.loadDevelopmentContent(data);
            this.loadMonitoringContent(data);
            
            // IA de forma assíncrona
            setTimeout(() => {
                this.loadAIContent(unityId).catch(() => {
                    this.showError('ai-content', 'Sistema de IA temporariamente indisponível');
                });
            }, 100);
            
            this.showSection('dashboard', document.getElementById('nav-dashboard'));
            this.showMessage(`Perfil carregado com sucesso!`, 'success', 3000);
            
        } catch (error) {
            console.error('Erro:', error);
            let errorMsg = "Erro ao conectar com a API.";
            
            if (error.name === 'TypeError') {
                errorMsg = "Servidor não encontrado. Verifique se a API está rodando na porta 8002.";
            }
            
            this.showMessage(errorMsg, 'error', 0);
            this.showError('dashboard-content', 'Falha na conexão');
            this.showError('profile-content', 'Falha na conexão');
            this.showError('ai-content', 'Falha na conexão');
            this.showError('heatmap-content', 'Falha na conexão');
            this.showError('readings-content', 'Falha na conexão');
            this.showError('monitoring-content', 'Falha na conexão');
        }
    },

    // Dashboard Content
    loadDashboardContent(data) {
        const profile = data.profile || {};
        const soilData = data.latest_soil_data || {};
        const dashboardData = data.dashboard_data || {};
        
        const soilParams = soilData.soil_parameters || {};
        const gameMetrics = soilData.game_metrics || {};
        const playerActions = soilData.player_actions || {};

        document.getElementById('dashboard-content').innerHTML = `
            <!-- Welcome Section -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 24px; padding: 3rem; margin-bottom: 2rem; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
                <div style="display: grid; grid-template-columns: 400px 1fr; gap: 3rem; align-items: center;">
                    <!-- Imagem à Esquerda -->
                    <div style="position: relative; display: flex; justify-content: center; align-items: center;">
                        <img src="../assets/images/inicio.jpg" alt="Bem-vindo ao Ekko" style="width: 100%; max-width: 350px; height: auto; border-radius: 20px; box-shadow: 0 20px 40px rgba(5, 150, 105, 0.15); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-5px) scale(1.02)'; this.style.boxShadow='0 25px 50px rgba(5, 150, 105, 0.25)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 20px 40px rgba(5, 150, 105, 0.15)'">
                        <div style="position: absolute; top: -15px; left: -15px; right: -15px; bottom: -15px; background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(59, 130, 246, 0.1)); border-radius: 28px; z-index: -1;"></div>
                    </div>
                    
                    <!-- Texto à Direita -->
                    <div style="padding-left: 2rem;">
                        <h1 style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 3.5rem; font-weight: 300; color: #1a202c; margin-bottom: 1rem; line-height: 1.1; letter-spacing: -0.02em;">Website Ekko</h1>
                        
                        <p style="font-family: 'Inter', sans-serif; font-size: 1.3rem; font-weight: 500; color: var(--secondary-green); margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.1em;">Agricultura Inteligente e Sustentável</p>
                        
                        <p style="font-family: 'Inter', sans-serif; font-size: 1.1rem; line-height: 1.7; color: var(--gray-600); margin-bottom: 2rem;">Aqui, você pode monitorar tanto os dados da sua simulação com os sensores da Unity quanto as análises feitas a partir deles. Descubra como a tecnologia pode transformar a agricultura através da gamificação e inteligência artificial.</p>
                        
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(5, 150, 105, 0.1); transition: all 0.3s ease;" onmouseover="this.style.paddingLeft='1rem'; this.style.background='rgba(5, 150, 105, 0.05)'; this.style.borderRadius='8px'; this.style.borderBottomColor='transparent'" onmouseout="this.style.paddingLeft='0'; this.style.background='transparent'; this.style.borderRadius='0'; this.style.borderBottomColor='rgba(5, 150, 105, 0.1)'">
                                <i class="fas fa-seedling" style="font-size: 1.3rem; color: var(--secondary-green); width: 20px; text-align: center;"></i>
                                <span style="font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 500; color: var(--gray-700);">Agricultura de Precisão</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(5, 150, 105, 0.1); transition: all 0.3s ease;" onmouseover="this.style.paddingLeft='1rem'; this.style.background='rgba(5, 150, 105, 0.05)'; this.style.borderRadius='8px'; this.style.borderBottomColor='transparent'" onmouseout="this.style.paddingLeft='0'; this.style.background='transparent'; this.style.borderRadius='0'; this.style.borderBottomColor='rgba(5, 150, 105, 0.1)'">
                                <i class="fas fa-brain" style="font-size: 1.3rem; color: var(--secondary-green); width: 20px; text-align: center;"></i>
                                <span style="font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 500; color: var(--gray-700);">Inovação Tecnológica</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; transition: all 0.3s ease;" onmouseover="this.style.paddingLeft='1rem'; this.style.background='rgba(5, 150, 105, 0.05)'; this.style.borderRadius='8px'" onmouseout="this.style.paddingLeft='0'; this.style.background='transparent'; this.style.borderRadius='0'">
                                <i class="fas fa-hands-helping" style="font-size: 1.3rem; color: var(--secondary-green); width: 20px; text-align: center;"></i>
                                <span style="font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 500; color: var(--gray-700);">Fraternidade e Ecologia</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- About Section -->
            <div class="unity-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-radius: 24px; overflow: hidden; position: relative;">
                <!-- Background Pattern -->
                <div style="position: absolute; top: 0; right: 0; width: 200px; height: 200px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.03), rgba(59, 130, 246, 0.03)); border-radius: 50%; transform: translate(50px, -50px);"></div>
                
                <div style="position: relative; z-index: 2; padding: 3rem;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 3rem;">
                        <h2 style="font-family: 'Playfair Display', 'Georgia', serif; color: var(--gray-800); margin: 0; font-size: 3.5rem; font-weight: 300; letter-spacing: -0.02em;">Sobre o Ekko</h2>
                    </div>
                    
                    <!-- Content Cards -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <!-- Card 1: Projeto -->
                        <div style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-left: 4px solid var(--tech-blue); transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                                <div style="background: linear-gradient(135deg, var(--tech-blue), #60A5FA); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-graduation-cap" style="color: white; font-size: 1.3rem;"></i>
                                </div>
                                <div>
                                    <h3 style="color: var(--gray-800); margin: 0; font-size: 1.2rem; font-weight: 600;">O Projeto</h3>
                                    <p style="color: var(--gray-500); margin: 0; font-size: 0.9rem;">Fraternidade e ecologia integral</p>
                                </div>
                            </div>
                            <p style="color: var(--gray-700); line-height: 1.7; margin: 0; font-size: 1rem;">Desenvolvido pela <strong style="color: var(--tech-blue);">equipe 34DS08</strong> do curso Desenvolvimento de Sistemas para a <strong style="color: var(--purple);">45ª Projete</strong> da ETE FMC. O tema de 2025 foca na <strong style="color: var(--secondary-green);">sustentabilidade</strong>, objetivo principal do Ekko: auxiliar agricultores através da tecnologia.</p>
                        </div>
                        
                        <!-- Card 2: Tecnologia -->
                        <div style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-left: 4px solid var(--secondary-green); transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                                <div style="background: linear-gradient(135deg, var(--secondary-green), var(--primary-green)); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-cogs" style="color: white; font-size: 1.3rem;"></i>
                                </div>
                                <div>
                                    <h3 style="color: var(--gray-800); margin: 0; font-size: 1.2rem; font-weight: 600;">Como Funciona</h3>
                                    <p style="color: var(--gray-500); margin: 0; font-size: 0.9rem;">Unity + IA + Dashboard</p>
                                </div>
                            </div>
                            <p style="color: var(--gray-700); line-height: 1.7; margin: 0; font-size: 1rem;">Através de uma <strong style="color: var(--orange);">simulação gamificada</strong> na Unity, o jogador controla sensores virtuais coletando dados de <strong style="color: var(--tech-blue);">pH, umidade, temperatura e nutrientes</strong> do solo. Os dados são processados neste website com <strong style="color: var(--purple);">IA, gráficos e estatísticas</strong> avançadas.</p>
                        </div>
                    </div>

                </div>
            </div>
                
            <!-- Project Stats -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
                <div style="text-align: center; padding: 2rem 1.5rem; background: linear-gradient(135deg, var(--white), #f8fafc); border-radius: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1); border: 2px solid rgba(59, 130, 246, 0.1); transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="background: linear-gradient(135deg, var(--tech-blue), #3b82f6); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-school" style="font-size: 1.5rem;"></i>
                    </div>
                    <div style="font-size: 1.1rem; color: var(--gray-800); font-weight: 600; margin-bottom: 0.25rem;">Projete</div>
                    <div style="font-size: 0.9rem; color: var(--gray-500);">ETE FMC</div>
                </div>
                
                <div style="text-align: center; padding: 2rem 1.5rem; background: linear-gradient(135deg, var(--white), #faf5ff); border-radius: 16px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1); border: 2px solid rgba(139, 92, 246, 0.1); transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="background: linear-gradient(135deg, var(--purple), #8b5cf6); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-leaf" style="font-size: 1.5rem;"></i>
                    </div>
                    <div style="font-size: 1.1rem; color: var(--gray-800); font-weight: 600; margin-bottom: 0.25rem;">Sustentabilidade</div>
                    <div style="font-size: 0.9rem; color: var(--gray-500);">Tema Central</div>
                </div>
                
                <div style="text-align: center; padding: 2rem 1.5rem; background: linear-gradient(135deg, var(--white), #f0fdf4); border-radius: 16px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.1); border: 2px solid rgba(34, 197, 94, 0.1); transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="background: linear-gradient(135deg, var(--secondary-green), #10b981); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-users" style="font-size: 1.5rem;"></i>
                    </div>
                    <div style="font-size: 1.1rem; color: var(--gray-800); font-weight: 600; margin-bottom: 0.25rem;">Equipe</div>
                    <div style="font-size: 0.9rem; color: var(--gray-500);">Desenvolvimento</div>
                </div>
                
                <div style="text-align: center; padding: 2rem 1.5rem; background: linear-gradient(135deg, var(--white), #fff7ed); border-radius: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.1); border: 2px solid rgba(249, 115, 22, 0.1); transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="background: linear-gradient(135deg, var(--orange), #f97316); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fab fa-unity" style="font-size: 1.5rem;"></i>
                    </div>
                    <div style="font-size: 1.1rem; color: var(--gray-800); font-weight: 600; margin-bottom: 0.25rem;">Unity</div>
                    <div style="font-size: 0.9rem; color: var(--gray-500);">Simulação</div>
                </div>
            </div>
            </div>
            
            <!-- Principais Funcionalidades -->
            <div class="unity-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--gray-800); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.3rem;">
                    <i class="fas fa-rocket" style="color: var(--primary-green);"></i> Principais Funcionalidades
                </h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
                    <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--primary-green);">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="background: var(--primary-green); color: white; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-robot" style="font-size: 1.5rem;"></i>
                            </div>
                            <h4 style="margin: 0; color: var(--gray-800); font-size: 1.1rem;">IA Avançada</h4>
                        </div>
                        <p style="color: var(--gray-700); margin: 0; line-height: 1.5;">Análise inteligente de 9 parâmetros do solo + Chatbot treinado com fontes renomadas do setor agrícola brasileiro</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--tech-blue);">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="background: var(--tech-blue); color: white; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-gamepad" style="font-size: 1.5rem;"></i>
                            </div>
                            <h4 style="margin: 0; color: var(--gray-800); font-size: 1.1rem;">Gamificação</h4>
                        </div>
                        <p style="color: var(--gray-700); margin: 0; line-height: 1.5;">Aprenda agricultura de forma divertida com sistema de pontuação, conquistas e desafios</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05)); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--orange);">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="background: var(--orange); color: white; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-satellite-dish" style="font-size: 1.5rem;"></i>
                            </div>
                            <h4 style="margin: 0; color: var(--gray-800); font-size: 1.1rem;">IoT & Sensores</h4>
                        </div>
                        <p style="color: var(--gray-700); margin: 0; line-height: 1.5;">Monitoramento contínuo com sensores IoT para pH, umidade, temperatura e nutrientes</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--purple);">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="background: var(--purple); color: white; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-chart-line" style="font-size: 1.5rem;"></i>
                            </div>
                            <h4 style="margin: 0; color: var(--gray-800); font-size: 1.1rem;">Dashboard Completo</h4>
                        </div>
                        <p style="color: var(--gray-700); margin: 0; line-height: 1.5;">Visualizações avançadas com mapas de calor, gráficos e relatórios detalhados</p>
                    </div>
                </div>
            </div>
            
            <!-- Status do Projeto -->
            <div class="unity-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--gray-800); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.3rem;">
                    <i class="fas fa-tasks" style="color: var(--tech-blue);"></i> Status do Projeto
                </h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 8px; border-left: 4px solid var(--secondary-green);">
                        <i class="fas fa-server" style="color: var(--secondary-green); font-size: 1.5rem;"></i>
                        <div>
                            <div style="font-weight: 600; color: var(--gray-800);">Backend</div>
                            <div style="font-size: 0.9rem; color: var(--secondary-green);">✅ Concluído</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 8px; border-left: 4px solid var(--secondary-green);">
                        <i class="fas fa-desktop" style="color: var(--secondary-green); font-size: 1.5rem;"></i>
                        <div>
                            <div style="font-weight: 600; color: var(--gray-800);">Frontend</div>
                            <div style="font-size: 0.9rem; color: var(--secondary-green);">✅ Concluído</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 8px; border-left: 4px solid var(--orange);">
                        <i class="fas fa-cog" style="color: var(--orange); font-size: 1.5rem;"></i>
                        <div>
                            <div style="font-weight: 600; color: var(--gray-800);">Simulação</div>
                            <div style="font-size: 0.9rem; color: var(--orange);">🔧 Desenvolvimento</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 8px; border-left: 4px solid var(--amber);">
                        <i class="fas fa-medal" style="color: var(--amber); font-size: 1.5rem;"></i>
                        <div>
                            <div style="font-weight: 600; color: var(--gray-800);">Premiação</div>
                            <div style="font-size: 0.9rem; color: var(--amber);">🕒 Aguardando...</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Dados do Usuário Atual -->
            <div class="unity-card">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--gray-800); margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1.3rem;">
                        <i class="fas fa-user" style="color: var(--purple);"></i> Seu Perfil 
                    </h3>
                    <button onclick="UnityDashboard.refreshData()" style="background: var(--tech-blue); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                        <i class="fas fa-sync-alt"></i> Atualizar
                    </button>
                </div>
                
                <!-- Métricas Unity -->
                <div class="unity-metrics" style="margin-bottom: 1.5rem;">
                    <div class="unity-metric-card" style="border-left-color: var(--primary-green);">
                        <div class="unity-metric-value" style="color: var(--primary-green);">${Number(soilParams.ph || 0).toFixed(1)}</div>
                        <div class="unity-metric-label">pH do Solo</div>
                        <div class="unity-metric-status" style="color: ${Number(soilParams.ph || 0) >= 6.0 && Number(soilParams.ph || 0) <= 7.0 ? 'var(--primary-green)' : 'var(--orange)'};">
                            ${Number(soilParams.ph || 0) >= 6.0 && Number(soilParams.ph || 0) <= 7.0 ? '✓ Ideal' : '⚠ Atenção'}
                        </div>
                    </div>
                    
                    <div class="unity-metric-card" style="border-left-color: var(--tech-blue);">
                        <div class="unity-metric-value" style="color: var(--tech-blue);">${Number(soilParams.umidade || 0).toFixed(0)}%</div>
                        <div class="unity-metric-label">Umidade</div>
                        <div class="unity-metric-status" style="color: ${Number(soilParams.umidade || 0) >= 40 && Number(soilParams.umidade || 0) <= 70 ? 'var(--primary-green)' : 'var(--orange)'};">
                            ${Number(soilParams.umidade || 0) >= 40 && Number(soilParams.umidade || 0) <= 70 ? '✓ Ideal' : '⚠ Atenção'}
                        </div>
                    </div>
                    
                    <div class="unity-metric-card" style="border-left-color: var(--orange);">
                        <div class="unity-metric-value" style="color: var(--orange);">${Number(soilParams.temperatura || 0).toFixed(0)}°C</div>
                        <div class="unity-metric-label">Temperatura</div>
                        <div class="unity-metric-status" style="color: ${Number(soilParams.temperatura || 0) >= 20 && Number(soilParams.temperatura || 0) <= 30 ? 'var(--primary-green)' : 'var(--orange)'};">
                            ${Number(soilParams.temperatura || 0) >= 20 && Number(soilParams.temperatura || 0) <= 30 ? '✓ Ideal' : '⚠ Atenção'}
                        </div>
                    </div>
                    

                    
                    <div class="unity-metric-card" style="border-left-color: var(--purple);">
                        <div class="unity-metric-value" style="color: var(--purple);">${gameMetrics.score || 0}</div>
                        <div class="unity-metric-label">Performance</div>
                        <div class="unity-metric-status" style="color: var(--gray-500);">Última sessão</div>
                    </div>
                </div>
                
                <!-- Cards Unity -->
                <div class="unity-info-grid">
                    <!-- Perfil Unity -->
                    <div class="unity-card" style="background: var(--gray-50);">
                        <div class="unity-card-header">
                            <div class="unity-card-icon">
                                <i class="fas fa-gamepad"></i>
                            </div>
                            <div>
                                <h3 class="unity-card-title">${profile.dados_pessoais?.nome || 'Jogador Unity'}</h3>
                                <p class="unity-card-subtitle">
                                    <i class="fas fa-tractor" style="color: var(--primary-green);"></i>
                                    ${dashboardData.propriedade || 'Fazenda Unity'}
                                </p>
                            </div>
                        </div>
                        
                        <div>
                            <div class="unity-data-row">
                                <i class="fas fa-id-card"></i>
                                <span><strong>Unity ID:</strong> ${this.currentUnityId}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-envelope"></i>
                                <span><strong>Email:</strong> ${profile.dados_pessoais?.email || 'N/A'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-expand-arrows-alt"></i>
                                <span><strong>Área:</strong> ${dashboardData.area || 0} ha</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Gaming Stats -->
                    <div class="unity-card" style="background: var(--gray-50);">
                        <div class="unity-card-header">
                            <div class="unity-card-icon" style="background: linear-gradient(135deg, var(--purple), var(--tech-blue));">
                                <i class="fas fa-gamepad"></i>
                            </div>
                            <div>
                                <h3 class="unity-card-title">Performance</h3>
                                <p class="unity-card-subtitle">Última sessão</p>
                            </div>
                        </div>
                        
                        <div>
                            <div class="unity-data-row">
                                <i class="fas fa-tint"></i>
                                <span><strong>Irrigação:</strong> ${playerActions.irrigacao || 0}%</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-coins"></i>
                                <span><strong>Dinheiro Gasto:</strong> R$ ${Number(gameMetrics.money_spent || 0).toFixed(2)}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-heart"></i>
                                <span><strong>Saúde Solo:</strong> ${dashboardData.soil_health || 50}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Profile Content
    loadProfileContent(data) {
        // Atualizar saudação do perfil
        const profileGreeting = document.getElementById('profile-greeting');
        if (profileGreeting && data.profile?.dados_pessoais?.nome) {
            const primeiroNome = data.profile.dados_pessoais.nome.split(' ')[0];
            profileGreeting.textContent = `Olá, ${primeiroNome}!`;
        }
        
        const profile = data.profile || {};
        const pessoais = profile.dados_pessoais || {};
        const propriedade = profile.propriedade || {};
        const experiencia = profile.experiencia || {};
        const unityStats = profile.unity_stats || {};
        const auditoria = profile.auditoria || {};

        // Formatação de datas
        const dataNascimento = pessoais.data_nascimento ? new Date(pessoais.data_nascimento).toLocaleDateString('pt-BR') : 'N/A';
        const dataCriacao = auditoria.created_at ? new Date(auditoria.created_at).toLocaleDateString('pt-BR') : 'N/A';
        const ultimoLogin = auditoria.last_login ? new Date(auditoria.last_login).toLocaleDateString('pt-BR') : 'Nunca';

        document.getElementById('profile-content').innerHTML = `
            <!-- Grid Principal 3 Colunas -->
            <div class="unity-info-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-bottom: 2rem;">
                <!-- Coluna 1: Dados Pessoais -->
                <div class="unity-card" style="border-left: 4px solid var(--primary-green);">
                    <h3 style="color: var(--primary-green); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-user-circle"></i> Dados Pessoais
                    </h3>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-user"></i>
                            <span><strong>Nome:</strong> ${pessoais.nome || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-envelope"></i>
                            <span><strong>Email:</strong> ${pessoais.email || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-phone"></i>
                            <span><strong>Telefone:</strong> ${pessoais.telefone || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-id-card"></i>
                            <span><strong>CPF:</strong> ${pessoais.cpf || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-birthday-cake"></i>
                            <span><strong>Nascimento:</strong> ${dataNascimento}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-venus-mars"></i>
                            <span><strong>Gênero:</strong> ${pessoais.genero || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-gamepad"></i>
                            <span><strong>Unity ID:</strong> ${this.currentUnityId}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Coluna 2: Propriedade & Localização -->
                <div class="unity-card" style="border-left: 4px solid var(--tech-blue);">
                    <h3 style="color: var(--tech-blue); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-map-marked-alt"></i> Propriedade & Localização
                    </h3>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-home"></i>
                            <span><strong>Nome Fazenda:</strong> ${propriedade.nome || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-expand-arrows-alt"></i>
                            <span><strong>Área:</strong> ${propriedade.area_hectares || 0} hectares</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Localização:</strong> ${propriedade.localizacao || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-mountain"></i>
                            <span><strong>Região:</strong> ${propriedade.regiao || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-layer-group"></i>
                            <span><strong>Tipo de Solo:</strong> ${propriedade.tipo_solo || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-tint"></i>
                            <span><strong>Irrigação:</strong> ${propriedade.irrigacao_disponivel ? 'Disponível' : 'Não disponível'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-certificate"></i>
                            <span><strong>Certificações:</strong> ${Array.isArray(propriedade.certificacoes) ? propriedade.certificacoes.join(', ') || 'Nenhuma' : 'Nenhuma'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Coluna 3: Experiência & Unity -->
                <div class="unity-card" style="border-left: 4px solid var(--orange);">
                    <h3 style="color: var(--orange); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-graduation-cap"></i> Experiência & Simulação
                    </h3>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-seedling"></i>
                            <span><strong>Anos de Agricultura:</strong> ${experiencia.anos_agricultura || 0} anos</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-microchip"></i>
                            <span><strong>Nível de Tecnologia:</strong> ${experiencia.nivel_tecnologia || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-leaf"></i>
                            <span><strong>Uso de Defensivos:</strong> ${experiencia.uso_defensivos || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-level-up-alt"></i>
                            <span><strong>Nível na Simulação:</strong> ${unityStats.nivel || 'Iniciante'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-play"></i>
                            <span><strong>Total Sessions:</strong> ${unityStats.total_sessions || 0}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-trophy"></i>
                            <span><strong>Melhor Score:</strong> ${unityStats.best_score || 0}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-clock"></i>
                            <span><strong>Tempo Total:</strong> ${Math.floor((unityStats.total_playtime || 0) / 60)} min</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Card Inferior: Achievements & Cultivos -->
            <div class="unity-info-grid" style="grid-template-columns: 1fr 1fr;">
                <!-- Achievements & Auditoria -->
                <div class="unity-card" style="border-left: 4px solid var(--purple);">
                    <h3 style="color: var(--purple); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-medal"></i> Achievements & Auditoria
                    </h3>
                    <div>
                        <!-- Achievements -->
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-star" style="color: var(--amber);"></i> Conquistas
                            </h4>
                            ${Array.isArray(unityStats.achievements) && unityStats.achievements.length > 0 ? 
                                unityStats.achievements.map(achievement => `
                                    <div style="display: inline-block; background: linear-gradient(135deg, var(--amber), var(--orange)); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; margin: 0.25rem; font-weight: 600;">
                                        <i class="fas fa-trophy"></i> ${achievement}
                                    </div>
                                `).join('') : 
                                '<p style="color: var(--gray-600); font-style: italic; font-size: 0.9rem;">Nenhuma conquista desbloqueada ainda</p>'
                            }
                        </div>
                        
                        <!-- Auditoria -->
                        <div>
                            <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-history" style="color: var(--tech-blue);"></i> Auditoria
                            </h4>
                            <div class="unity-data-row">
                                <i class="fas fa-calendar-plus"></i>
                                <span><strong>Criado em:</strong> ${dataCriacao}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-sign-in-alt"></i>
                                <span><strong>Último Login:</strong> ${ultimoLogin}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-hashtag"></i>
                                <span><strong>Total Logins:</strong> ${auditoria.login_count || 0}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-check-circle"></i>
                                <span><strong>Status:</strong> 
                                    <span style="color: ${auditoria.status === 'active' ? 'var(--secondary-green)' : 'var(--orange)'}; font-weight: 600;">
                                        ${auditoria.status === 'active' ? 'Ativo' : auditoria.status || 'N/A'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cultivos Principais -->
                <div class="unity-card" style="border-left: 4px solid var(--secondary-green);">
                    <h3 style="color: var(--secondary-green); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-leaf"></i> Cultivos Principais
                    </h3>
                    <div>
                        <!-- Cultivos Grid -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                            ${Array.isArray(propriedade.cultivos_principais) ? propriedade.cultivos_principais.map((cultivo, index) => {
                                const areaEstimada = (propriedade.area_hectares / propriedade.cultivos_principais.length).toFixed(1);
                                const produtividade = this.getProductivityByCrop(cultivo, propriedade.regiao);
                                return `
                                    <div style="text-align: center; padding: 1rem; background: var(--gray-50); border-radius: 8px; border: 2px solid var(--secondary-green);">
                                        <i class="fas fa-${this.getCultivoIcon(cultivo)}" style="font-size: 1.5rem; color: var(--secondary-green); margin-bottom: 0.5rem;"></i>
                                        <div style="font-weight: 600; color: var(--gray-800); font-size: 0.9rem;">${cultivo}</div>
                                        <div style="font-size: 0.8rem; color: var(--gray-600);">${areaEstimada} ha</div>
                                        <div style="font-size: 0.75rem; color: var(--secondary-green); font-weight: 600;">${produtividade}</div>
                                    </div>
                                `;
                            }).join('') : '<p style="color: var(--gray-600); font-style: italic;">Nenhum cultivo cadastrado</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Função auxiliar para ícones de cultivos
    getCultivoIcon(cultivo) {
        const icons = {
            'Café': 'coffee',
            'Milho': 'seedling',
            'Soja': 'leaf',
            'Cana': 'sugar-cane',
            'Feijão': 'circle',
            'Arroz': 'seedling',
            'Trigo': 'wheat-awn'
        };
        return icons[cultivo] || 'leaf';
    },

    // Função auxiliar para produtividade por cultivo e região
    getProductivityByCrop(cultivo, regiao) {
        const produtividade = {
            'Café': {
                'Sul de Minas': '28 sc/ha',
                'Zona da Mata': '25 sc/ha',
                'default': '26 sc/ha'
            },
            'Milho': {
                'Sul de Minas': '8.5 t/ha',
                'Triângulo Mineiro': '9.2 t/ha',
                'default': '8.8 t/ha'
            },
            'Soja': {
                'Triângulo Mineiro': '3.8 t/ha',
                'Sul de Minas': '3.5 t/ha',
                'default': '3.6 t/ha'
            },
            'Cana': {
                'Zona da Mata': '85 t/ha',
                'Triângulo Mineiro': '90 t/ha',
                'default': '87 t/ha'
            },
            'Feijão': {
                'Sul de Minas': '2.2 t/ha',
                'default': '2.0 t/ha'
            }
        };
        
        const cultivoData = produtividade[cultivo];
        if (!cultivoData) return 'N/A';
        
        return cultivoData[regiao] || cultivoData['default'] || 'N/A';
    },

    // Readings Content
    loadReadingsContent(data) {
        const profile = data.profile || {};
        const unityStats = profile.unity_stats || {};
        const auditoria = profile.auditoria || {};
        
        // Simular sessões baseadas nos dados reais
        const totalSessions = unityStats.total_sessions || 0;
        const totalPlaytime = unityStats.total_playtime || 0;
        const bestScore = unityStats.best_score || 0;
        const avgSessionTime = totalSessions > 0 ? Math.floor(totalPlaytime / totalSessions) : 0;
        
        document.getElementById('readings-content').innerHTML = `
            <!-- Stats Resumo -->
            <div class="unity-metrics" style="margin-bottom: 2rem;">
                <div class="unity-metric-card" style="border-left-color: var(--primary-green);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-play" style="color: var(--primary-green); font-size: 1.2rem;"></i>
                    </div>
                    <div class="unity-metric-value" style="color: var(--primary-green);">${totalSessions}</div>
                    <div class="unity-metric-label">Total de Sessões</div>
                </div>
                <div class="unity-metric-card" style="border-left-color: var(--tech-blue);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-clock" style="color: var(--tech-blue); font-size: 1.2rem;"></i>
                    </div>
                    <div class="unity-metric-value" style="color: var(--tech-blue);">${Math.floor(totalPlaytime / 60)}</div>
                    <div class="unity-metric-label">Minutos Jogados</div>
                </div>
                <div class="unity-metric-card" style="border-left-color: var(--orange);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-trophy" style="color: var(--orange); font-size: 1.2rem;"></i>
                    </div>
                    <div class="unity-metric-value" style="color: var(--orange);">${bestScore}</div>
                    <div class="unity-metric-label">Melhor Score</div>
                </div>
                <div class="unity-metric-card" style="border-left-color: var(--purple);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-chart-bar" style="color: var(--purple); font-size: 1.2rem;"></i>
                    </div>
                    <div class="unity-metric-value" style="color: var(--purple);">${avgSessionTime}</div>
                    <div class="unity-metric-label">Tempo Médio (min)</div>
                </div>
            </div>
            
            <div class="unity-card">
                <h3 style="color: var(--primary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-line"></i> Histórico de Atividades Unity
                </h3>
                ${totalSessions > 0 ? `
                    <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                        <h4 style="color: var(--gray-800); margin-bottom: 1rem;">Estatísticas de Jogo</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div class="unity-data-row">
                                <i class="fas fa-play"></i>
                                <span><strong>Sessões Totais:</strong> ${totalSessions}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-clock"></i>
                                <span><strong>Tempo Total:</strong> ${Math.floor(totalPlaytime / 60)} minutos</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-trophy"></i>
                                <span><strong>Melhor Score:</strong> ${bestScore} pontos</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-chart-bar"></i>
                                <span><strong>Média por Sessão:</strong> ${avgSessionTime} min</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-level-up-alt"></i>
                                <span><strong>Nível Atual:</strong> ${unityStats.nivel || 'Iniciante'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-medal"></i>
                                <span><strong>Conquistas:</strong> ${Array.isArray(unityStats.achievements) ? unityStats.achievements.length : 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, var(--gray-50), var(--white)); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--tech-blue);">
                        <h4 style="color: var(--tech-blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-info-circle"></i> Informações da Conta
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                            <div class="unity-data-row">
                                <i class="fas fa-calendar-plus"></i>
                                <span><strong>Conta Criada:</strong> ${auditoria.created_at ? new Date(auditoria.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-sign-in-alt"></i>
                                <span><strong>Último Login:</strong> ${auditoria.last_login ? new Date(auditoria.last_login).toLocaleDateString('pt-BR') : 'Nunca'}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-hashtag"></i>
                                <span><strong>Total de Logins:</strong> ${auditoria.login_count || 0}</span>
                            </div>
                            <div class="unity-data-row">
                                <i class="fas fa-check-circle"></i>
                                <span><strong>Status da Conta:</strong> 
                                    <span style="color: ${auditoria.status === 'active' ? 'var(--secondary-green)' : 'var(--orange)'}; font-weight: 600;">
                                        ${auditoria.status === 'active' ? 'Ativa' : auditoria.status || 'N/A'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div style="text-align: center; padding: 3rem; background: var(--gray-50); border-radius: 12px;">
                        <i class="fas fa-gamepad" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                        <h4 style="color: var(--gray-600); margin-bottom: 0.5rem;">Nenhuma Sessão Registrada</h4>
                        <p style="color: var(--gray-500);">Comece a jogar para ver seu histórico aqui!</p>
                        <div style="margin-top: 1.5rem;">
                            <div class="unity-data-row" style="justify-content: center; background: white; display: inline-flex; padding: 1rem 2rem; border-radius: 8px;">
                                <i class="fas fa-calendar-plus"></i>
                                <span><strong>Conta criada em:</strong> ${auditoria.created_at ? new Date(auditoria.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;
    },

    // Heatmap Content
    loadHeatmapContent(data) {
        const soilHistory = data.soil_history || [];
        
        if (soilHistory.length === 0) {
            this.showEmpty('heatmap-content', 'Não há dados de solo suficientes para gerar mapas de calor');
            return;
        }
        
        document.getElementById('heatmap-content').innerHTML = `
            <!-- Controles do Mapa -->
            <div class="unity-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-green); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-sliders-h"></i> Controles do Mapa
                </h3>
                <div class="unity-info-grid" style="grid-template-columns: 1fr 1fr;">
                    <div style="background: rgba(255,255,255,0.8); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--gray-200);">
                        <label style="font-family: 'Poppins', sans-serif; font-weight: 600; color: var(--gray-800); display: block; margin-bottom: 0.75rem;">Parâmetro de Análise</label>
                        <select id="unity-heatmap-parameter" onchange="UnityDashboard.updateHeatmapView()" style="width: 100%; padding: 0.75rem 1rem; border: 2px solid var(--gray-200); border-radius: 12px; font-size: 1rem; background: white;">
                            <option value="ph">pH do Solo</option>
                            <option value="umidade">Umidade (%)</option>
                            <option value="temperatura">Temperatura (°C)</option>
                            <option value="condutividade">Condutividade</option>
                            <option value="salinidade">Salinidade</option>
                            <option value="npk">NPK Total</option>
                            <option value="score">Score Unity</option>
                        </select>
                    </div>
                    <div style="background: rgba(255,255,255,0.8); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--gray-200);">
                        <label style="font-family: 'Poppins', sans-serif; font-weight: 600; color: var(--gray-800); display: block; margin-bottom: 0.75rem;">Período de Tempo</label>
                        <select id="unity-heatmap-period" onchange="UnityDashboard.updateHeatmapView()" style="width: 100%; padding: 0.75rem 1rem; border: 2px solid var(--gray-200); border-radius: 12px; font-size: 1rem; background: white;">
                            <option value="latest">Última Sessão</option>
                            <option value="week">Última Semana</option>
                            <option value="month">Último Mês</option>
                            <option value="all">Todas as Sessões</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Mapas Principais -->
            <div class="unity-info-grid" style="margin-bottom: 2rem;">
                <!-- Mapa de Parâmetros vs Tempo -->
                <div class="unity-card">
                    <h4 style="color: var(--primary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chart-line"></i> <span id="unity-timeline-title">Evolução do pH no Tempo</span>
                    </h4>
                    <div style="position: relative; height: 300px; background: var(--gray-50); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <canvas id="unityTimelineChart" style="max-width: 100%; max-height: 100%;"></canvas>
                    </div>
                </div>
                
                <!-- Mapa de Calor Real -->
                <div class="unity-card">
                    <h4 style="color: var(--tech-blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-fire"></i> <span id="unity-heatmap-title">Mapa de Calor - pH</span>
                    </h4>
                    <div style="position: relative; height: 350px; background: var(--gray-50); border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 25px;">
                        <canvas id="unityHeatmapChart" style="border-radius: 8px;"></canvas>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                            <span style="width: 16px; height: 16px; border-radius: 3px; background: #ff4444;"></span>
                            <span>Crítico</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                            <span style="width: 16px; height: 16px; border-radius: 3px; background: #ffaa00;"></span>
                            <span>Atenção</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                            <span style="width: 16px; height: 16px; border-radius: 3px; background: #00aa00;"></span>
                            <span>Ideal</span>
                        </div>
                    </div>
                </div>
            </div>
            

        `;
        
        // Armazenar dados para os gráficos
        window.unitySoilData = soilHistory;
        
        // Inicializar gráficos
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                this.initializeUnityCharts();
                this.updateHeatmapView();
            } else {
                console.error('Chart.js não carregado');
            }
        }, 1000);
    },

    // AI Content - Nova implementação com análise real
    async loadAIContent(unityId) {
        try {
            // Buscar análise IA do backend com cache-busting
            const timestamp = new Date().getTime();
            const response = await fetch(`${this.baseUrl}/unity/analise-ia/${unityId}?t=${timestamp}`);
            
            if (response.ok) {
                const analiseIA = await response.json();
                this.renderAnaliseIA(analiseIA);
            } else {
                // Fallback para análise local se API não disponível
                this.renderAnaliseLocal();
            }
        } catch (error) {
            console.error('Erro ao carregar IA:', error);
            this.renderAnaliseLocal();
        }
    },
    
    // Função para forçar atualização dos dados
    async refreshData() {
        if (!this.currentUnityId) return;
        
        this.showLoading('ai-content', 'Atualizando dados...');
        this.showLoading('dashboard-content', 'Atualizando...');
        
        try {
            // Recarregar dados do dashboard
            const timestamp = new Date().getTime();
            const response = await fetch(`${this.baseUrl}/unity/dashboard/${this.currentUnityId}?t=${timestamp}`);
            
            if (response.ok) {
                const data = await response.json();
                this.currentUserData = data;
                
                // Atualizar seções
                this.loadDashboardContent(data);
                await this.loadAIContent(this.currentUnityId);
                
                this.showMessage('Dados atualizados com sucesso!', 'success', 3000);
            }
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            this.showMessage('Erro ao atualizar dados', 'error', 5000);
        }
    },
    
    // Renderizar análise IA do backend
    renderAnaliseIA(data) {
        const diagnostico = data.diagnostico || {};
        const parametros = diagnostico.parametros || {};
        const resumo = data.resumo || {};
        const acoesPrioritarias = diagnostico.acoes_prioritarias || [];
        
        document.getElementById('ai-content').innerHTML = `
            <!-- Análise IA -->
            <div class="unity-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--gray-50), var(--white)); border-left: 4px solid var(--purple);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
                    <div>
                        <h2 style="color: var(--gray-800); margin: 0; display: flex; align-items: center; gap: 0.75rem; font-size: 1.6rem;">
                            <i class="fas fa-robot" style="color: var(--purple);"></i> Análise Inteligente do Solo
                        </h2>
                        <p style="color: var(--gray-600); margin: 0.5rem 0 0 0; font-size: 1rem;">Diagnóstico completo baseado em IA</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <button onclick="PDFExporter.exportarRelatorio()" style="background: linear-gradient(135deg, #EF4444, #DC2626); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; font-weight: 600; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(239, 68, 68, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(239, 68, 68, 0.3)'">
                            <i class="fas fa-file-pdf"></i> Exportar Relatório PDF
                        </button>
                        <button onclick="UnityDashboard.refreshData()" style="background: var(--secondary-green); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                            <i class="fas fa-sync-alt"></i> Atualizar
                        </button>
                        <div style="background: var(--white); padding: 0.75rem 1.5rem; border-radius: 12px; border: 1px solid var(--gray-200); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-seedling" style="color: var(--secondary-green);"></i>
                                <span style="font-weight: 600; color: var(--gray-800);">${data.cultivo_principal || 'Cultivo Geral'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Métricas Principais -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem; font-weight: 700; color: var(--secondary-green);">${Math.round(diagnostico.saude_geral || 0)}%</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Saúde Geral</div>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">${this.getHealthStatus(diagnostico.saude_geral)}</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem; font-weight: 700; color: var(--tech-blue);">${resumo.parametros_ideais || 0}/${resumo.total_parametros || 0}</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Parâmetros Ideais</div>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">${Math.round(((resumo.parametros_ideais || 0) / (resumo.total_parametros || 1)) * 100)}% otimizado</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem; font-weight: 700; color: ${(diagnostico.alertas_criticos || []).length === 0 ? 'var(--secondary-green)' : 'var(--orange)'};">${(diagnostico.alertas_criticos || []).length}</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Alertas Críticos</div>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">${(diagnostico.alertas_criticos || []).length === 0 ? 'Tudo OK' : 'Atenção'}</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem; font-weight: 700; color: var(--purple);">${resumo.nivel_sustentabilidade || 0}%</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Sustentabilidade</div>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">${this.getSustainabilityLevel(resumo.nivel_sustentabilidade)}</div>
                    </div>
                </div>
            </div>
            

            
            <!-- Análise Detalhada por Parâmetro -->
            <div class="unity-card">
                <h3 style="color: var(--gray-800); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.4rem;">
                    <i class="fas fa-microscope" style="color: var(--purple);"></i> Análise Detalhada dos Parâmetros
                </h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
                    ${Object.entries(parametros).map(([param, data]) => `
                        <div style="background: var(--white); border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 4px solid ${this.getStatusColor(data.status)};">
                            <!-- Header do Parâmetro -->
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="background: ${this.getStatusColor(data.status)}; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-${this.getParametroIcon(param)}" style="font-size: 1.2rem;"></i>
                                    </div>
                                    <h4 style="color: var(--gray-800); margin: 0; font-size: 1.1rem; font-weight: 600;">${this.getParametroNome(param)}</h4>
                                </div>
                                <div style="padding: 0.5rem 1rem; border-radius: 20px; background: ${this.getStatusColor(data.status)}; color: white; font-size: 0.8rem; font-weight: 600;">
                                    ${this.getStatusTexto(data.status)}
                                </div>
                            </div>
                            
                            <!-- Valor Principal -->
                            <div style="text-align: center; margin-bottom: 1.5rem; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                                <div style="font-size: 2.5rem; font-weight: 700; color: ${this.getStatusColor(data.status)}; margin-bottom: 0.5rem;">
                                    ${data.valor}${this.getParametroUnidade(param)}
                                </div>
                                <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">
                                    Faixa Ideal: ${data.faixa_ideal}
                                </div>
                            </div>
                            
                            <!-- Impacto -->
                            <div style="margin-bottom: 1.5rem;">
                                <h5 style="color: var(--gray-800); margin-bottom: 0.75rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                                    <i class="fas fa-info-circle" style="color: ${this.getStatusColor(data.status)};"></i> Impacto no Solo
                                </h5>
                                <p style="color: var(--gray-700); font-size: 0.9rem; margin: 0; line-height: 1.5; padding: 1rem; background: var(--white); border: 1px solid var(--gray-200); border-radius: 8px;">${data.impacto}</p>
                            </div>
                            
                            <!-- Recomendação -->
                            <button onclick="UnityDashboard.showSoilTips('${param}', ${data.valor}, '${this.getParametroNome(param)}')" style="width: 100%; background: linear-gradient(135deg, ${this.getStatusColor(data.status)}, ${this.getStatusColorDark(data.status)}); padding: 1.25rem; border-radius: 8px; color: white; border: none; cursor: pointer; text-align: left; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <h5 style="margin-bottom: 0.75rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                                    <i class="fas fa-lightbulb"></i> Ver Dicas de Melhoria
                                </h5>
                                <p style="font-size: 0.9rem; margin: 0; line-height: 1.5; font-weight: 500;">${data.sugestao}</p>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // Renderizar análise local (fallback)
    renderAnaliseLocal() {
        const profile = this.currentUserData.profile || {};
        const experiencia = profile.experiencia || {};
        const propriedade = profile.propriedade || {};
        const unityStats = profile.unity_stats || {};
        const auditoria = profile.auditoria || {};
        
        // Análise baseada nos dados reais
        const perfilJogador = this.analisarPerfilJogador(experiencia, unityStats);
        const recomendacoes = this.gerarRecomendacoes(propriedade, experiencia);
        const performance = this.analisarPerformance(unityStats, auditoria);
        
        document.getElementById('ai-content').innerHTML = `
            <div class="unity-info-grid" style="margin-bottom: 2rem;">
                <!-- Perfil de Jogador -->
                <div class="unity-card" style="border-left: 4px solid var(--purple);">
                    <h3 style="color: var(--purple); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-user-astronaut"></i> Perfil de Jogador
                    </h3>
                    <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 12px; margin-bottom: 1rem;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${perfilJogador.emoji}</div>
                        <h4 style="color: var(--purple); margin-bottom: 0.5rem;">${perfilJogador.tipo}</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">${perfilJogador.descricao}</p>
                    </div>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-microchip"></i>
                            <span><strong>Nível Tech:</strong> ${experiencia.nivel_tecnologia || 'N/A'}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-leaf"></i>
                            <span><strong>Sustentabilidade:</strong> ${perfilJogador.sustentabilidade}</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-gamepad"></i>
                            <span><strong>Gaming Level:</strong> ${unityStats.nivel || 'Iniciante'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Análise de Performance -->
                <div class="unity-card" style="border-left: 4px solid var(--tech-blue);">
                    <h3 style="color: var(--tech-blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chart-line"></i> Análise de Performance
                    </h3>
                    <div>
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: var(--gray-700);">Engajamento</span>
                                <span style="color: ${performance.engajamento.cor}; font-weight: 600;">${performance.engajamento.nivel}</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${performance.engajamento.porcentagem}%; height: 100%; background: ${performance.engajamento.cor}; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: var(--gray-700);">Consistência</span>
                                <span style="color: ${performance.consistencia.cor}; font-weight: 600;">${performance.consistencia.nivel}</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${performance.consistencia.porcentagem}%; height: 100%; background: ${performance.consistencia.cor}; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: var(--gray-700);">Progresso</span>
                                <span style="color: ${performance.progresso.cor}; font-weight: 600;">${performance.progresso.nivel}</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${performance.progresso.porcentagem}%; height: 100%; background: ${performance.progresso.cor}; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recomendações Personalizadas -->
            <div class="unity-card" style="border-left: 4px solid var(--secondary-green);">
                <h3 style="color: var(--secondary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-lightbulb"></i> Recomendações Personalizadas
                </h3>
                <div class="unity-info-grid">
                    <!-- Cultivos Sugeridos -->
                    <div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-seedling" style="color: var(--secondary-green);"></i> Cultivos Sugeridos
                        </h4>
                        <div>
                            ${recomendacoes.cultivos_sugeridos.map(cultivo => `
                                <div style="display: inline-block; background: linear-gradient(135deg, var(--secondary-green), var(--primary-green)); color: white; padding: 0.5rem 1rem; border-radius: 20px; margin: 0.25rem; font-size: 0.9rem; font-weight: 600;">
                                    <i class="fas fa-${this.getCultivoIcon(cultivo)}"></i> ${cultivo}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Tecnologias Recomendadas -->
                    <div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-microchip" style="color: var(--tech-blue);"></i> Tecnologias
                        </h4>
                        <div>
                            ${recomendacoes.tecnologias.map(tech => `
                                <div style="display: inline-block; background: linear-gradient(135deg, var(--tech-blue), var(--cyan)); color: white; padding: 0.5rem 1rem; border-radius: 20px; margin: 0.25rem; font-size: 0.9rem; font-weight: 600;">
                                    <i class="fas fa-cog"></i> ${tech}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Certificações Próximas -->
                    <div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-certificate" style="color: var(--amber);"></i> Próximas Certificações
                        </h4>
                        <div>
                            ${recomendacoes.certificacoes_proximas.map(cert => `
                                <div style="display: inline-block; background: linear-gradient(135deg, var(--amber), var(--orange)); color: white; padding: 0.5rem 1rem; border-radius: 20px; margin: 0.25rem; font-size: 0.9rem; font-weight: 600;">
                                    <i class="fas fa-award"></i> ${cert}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Funções auxiliares para IA
    getSaudeColor(saude) {
        if (saude >= 80) return 'var(--secondary-green)';
        if (saude >= 60) return 'var(--orange)';
        return 'var(--red)';
    },
    
    getHealthStatus(saude) {
        if (saude >= 90) return 'Excelente';
        if (saude >= 80) return 'Muito Bom';
        if (saude >= 70) return 'Bom';
        if (saude >= 60) return 'Regular';
        if (saude >= 40) return 'Ruim';
        return 'Crítico';
    },
    
    getSustainabilityLevel(nivel) {
        if (nivel >= 80) return 'Alto';
        if (nivel >= 60) return 'Médio';
        return 'Baixo';
    },
    
    getTrendIcon(trend) {
        if (trend === 'Melhorando') return '📈';
        if (trend === 'Declinando') return '📉';
        return '📊';
    },
    
    getStatusBg(status) {
        const bgs = {
            'ideal': 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02))',
            'aceitavel': 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02))',
            'atencao': 'linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(249, 115, 22, 0.02))',
            'critico': 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02))'
        };
        return bgs[status] || 'var(--gray-50)';
    },
    
    getStatusColorDark(status) {
        const cores = {
            'ideal': '#059669',
            'aceitavel': '#047857',
            'atencao': '#ea580c',
            'critico': '#dc2626'
        };
        return cores[status] || 'var(--gray-600)';
    },
    
    getStatusColor(status) {
        const cores = {
            'ideal': 'var(--secondary-green)',
            'aceitavel': 'var(--primary-green)',
            'atencao': 'var(--orange)',
            'critico': 'var(--red)'
        };
        return cores[status] || 'var(--gray-500)';
    },
    
    getStatusTexto(status) {
        const textos = {
            'ideal': '✓ IDEAL',
            'aceitavel': '✓ ACEITÁVEL',
            'atencao': '⚠ ATENÇÃO',
            'critico': '❌ CRÍTICO'
        };
        return textos[status] || 'N/A';
    },
    
    getParametroIcon(param) {
        const icons = {
            'ph': 'flask',
            'umidade': 'tint',
            'temperatura': 'thermometer-half',
            'salinidade': 'water',
            'nitrogenio': 'leaf',
            'fosforo': 'seedling',
            'potassio': 'tree',
            'condutividade': 'bolt',
            'materia_organica': 'recycle',
            'performance': 'gamepad'
        };
        return icons[param] || 'chart-bar';
    },
    
    getParametroNome(param) {
        const nomes = {
            'ph': 'pH do Solo',
            'umidade': 'Umidade',
            'temperatura': 'Temperatura',
            'salinidade': 'Salinidade',
            'nitrogenio': 'Nitrogênio (N)',
            'fosforo': 'Fósforo (P)',
            'potassio': 'Potássio (K)',
            'condutividade': 'Condutividade',
            'materia_organica': 'Matéria Orgânica',
            'performance': 'Performance Unity'
        };
        return nomes[param] || param.toUpperCase();
    },
    
    getParametroUnidade(param) {
        const unidades = {
            'ph': '',
            'umidade': '%',
            'temperatura': '°C',
            'salinidade': ' ppm',
            'nitrogenio': ' mg/kg',
            'fosforo': ' mg/kg',
            'potassio': ' mg/kg',
            'condutividade': ' dS/m',
            'performance': ' pts'
        };
        return unidades[param] || '';
    },
    
    // Funções auxiliares para IA
    analisarPerfilJogador(experiencia, unityStats) {
        const anosAgricultura = experiencia.anos_agricultura || 0;
        const nivelTech = experiencia.nivel_tecnologia || '';
        const usoDefensivos = experiencia.uso_defensivos || '';
        
        let tipo, emoji, descricao, sustentabilidade;
        
        if (anosAgricultura > 10 && nivelTech === 'Avançado') {
            tipo = 'Agricultor Tech Expert';
            emoji = '🚀';
            descricao = 'Agricultor experiente com alta adoção tecnológica';
        } else if (anosAgricultura > 10) {
            tipo = 'Agricultor Experiente';
            emoji = '🌾';
            descricao = 'Vasta experiência em práticas agrícolas tradicionais';
        } else if (nivelTech === 'Avançado') {
            tipo = 'Tech Enthusiast';
            emoji = '💻';
            descricao = 'Jovem agricultor com foco em inovação tecnológica';
        } else {
            tipo = 'Agricultor Iniciante';
            emoji = '🌱';
            descricao = 'Começando a jornada na agricultura moderna';
        }
        
        sustentabilidade = usoDefensivos === 'Reduzido' ? 'Alto' : usoDefensivos === 'Moderado' ? 'Médio' : 'Baixo';
        
        return { tipo, emoji, descricao, sustentabilidade };
    },
    
    gerarRecomendacoes(propriedade, experiencia) {
        const regiao = propriedade.regiao || '';
        const nivelTech = experiencia.nivel_tecnologia || '';
        const certificacoes = propriedade.certificacoes || [];
        
        let cultivos_sugeridos = [];
        let tecnologias = [];
        let certificacoes_proximas = [];
        
        // Cultivos por região
        if (regiao.includes('Sul de Minas')) {
            cultivos_sugeridos = ['Café', 'Milho', 'Feijão'];
        } else if (regiao.includes('Triângulo')) {
            cultivos_sugeridos = ['Soja', 'Milho', 'Sorgo'];
        } else if (regiao.includes('Zona da Mata')) {
            cultivos_sugeridos = ['Cana', 'Café', 'Pastagem'];
        } else {
            cultivos_sugeridos = ['Milho', 'Soja', 'Feijão'];
        }
        
        // Tecnologias por nível
        if (nivelTech === 'Avançado') {
            tecnologias = ['IoT Sensors', 'Drones', 'IA Predictiva', 'Agricultura de Precisão'];
        } else if (nivelTech === 'Intermediário') {
            tecnologias = ['Sensores Básicos', 'GPS', 'Irrigação Automatizada'];
        } else {
            tecnologias = ['Sensores de Solo', 'Aplicativo Mobile', 'Monitoramento Básico'];
        }
        
        // Certificações
        if (certificacoes.includes('Orgânico')) {
            certificacoes_proximas = ['Biodinâmico', 'Fair Trade', 'Rainforest Alliance'];
        } else {
            certificacoes_proximas = ['Orgânico', 'Boas Práticas', 'Sustentável'];
        }
        
        return { cultivos_sugeridos, tecnologias, certificacoes_proximas };
    },
    
    analisarPerformance(unityStats, auditoria) {
        const totalSessions = unityStats.total_sessions || 0;
        const loginCount = auditoria.login_count || 0;
        const bestScore = unityStats.best_score || 0;
        
        // Engajamento
        let engajamento;
        if (totalSessions > 10) {
            engajamento = { nivel: 'Alto', cor: 'var(--secondary-green)', porcentagem: 85 };
        } else if (totalSessions > 5) {
            engajamento = { nivel: 'Médio', cor: 'var(--orange)', porcentagem: 60 };
        } else {
            engajamento = { nivel: 'Baixo', cor: 'var(--red)', porcentagem: 30 };
        }
        
        // Consistência
        let consistencia;
        if (loginCount > 15) {
            consistencia = { nivel: 'Consistente', cor: 'var(--secondary-green)', porcentagem: 90 };
        } else if (loginCount > 5) {
            consistencia = { nivel: 'Regular', cor: 'var(--orange)', porcentagem: 65 };
        } else {
            consistencia = { nivel: 'Esporádico', cor: 'var(--red)', porcentagem: 25 };
        }
        
        // Progresso
        let progresso;
        if (bestScore > 800) {
            progresso = { nivel: 'Excelente', cor: 'var(--secondary-green)', porcentagem: 95 };
        } else if (bestScore > 500) {
            progresso = { nivel: 'Bom', cor: 'var(--orange)', porcentagem: 70 };
        } else {
            progresso = { nivel: 'Em Desenvolvimento', cor: 'var(--tech-blue)', porcentagem: 40 };
        }
        
        return { engajamento, consistencia, progresso };
    },

    // Utility Functions
    showSection(sectionId, clickedElement = null) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        if (clickedElement) {
            clickedElement.classList.add('active');
        }
        
        const titles = {
            'dashboard': 'Dashboard Principal',
            'profile': 'Minha Conta',
            'ai': 'Análise Inteligente',
            'heatmap': 'Relatórios',
            'readings': 'Simulação',
            'development': 'Sobre o Sistema',
            'monitoring': 'Supervisão',
            'chatbot': 'Chatbot'
        };
        
        const contextualInfo = {
            'dashboard': 'Bem-vindo de volta! Monitore sua fazenda virtual e dados em tempo real',
            'profile': `Acesse suas informações pessoais • ${this.currentUserData?.profile?.unity_stats?.total_sessions || 0} sessões • Nível ${this.currentUserData?.profile?.unity_stats?.nivel || 'Iniciante'}`,
            'ai': 'Análise baseada em 9 parâmetros de solo • IA treinada com fontes brasileiras',
            'heatmap': 'Visualizações detalhadas dos dados coletados durante a simulação',
            'readings': 'Histórico completo das suas sessões de jogo e performance',
            'development': 'Documentação técnica',
            'monitoring': 'Acompanhe em tempo real os dados coletados por tecnologia IoT simulada',
            'chatbot': 'Converse com nossa IA especializada em agricultura sustentável'
        };
        
        if (titles[sectionId]) {
            document.getElementById('page-title').textContent = titles[sectionId];
            document.getElementById('breadcrumb').textContent = contextualInfo[sectionId];
        }
    },

    showMessage(text, type = 'success', duration = 5000) {
        const messageDiv = document.getElementById("mensagem");
        if (messageDiv) {
            messageDiv.className = `message ${type}`;
            messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${text}`;
            messageDiv.style.display = 'flex';
            
            if (duration > 0) {
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, duration);
            }
        }
    },

    showLoading(elementId, text = 'Carregando...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="loading"><i class="fas fa-spinner"></i> ${text}</div>`;
        }
    },

    showError(elementId, message = 'Erro ao carregar dados') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 0.5rem;">Ops! Algo deu errado</h3>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem; background: var(--unity-primary); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; cursor: pointer;">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                </div>
            `;
        }
    },
    
    // Inicializar gráficos Unity
    initializeUnityCharts() {
        const timelineCanvas = document.getElementById('unityTimelineChart');
        const heatmapCanvas = document.getElementById('unityHeatmapChart');
        
        if (!timelineCanvas || !heatmapCanvas) {
            return;
        }
        
        // Destruir gráficos existentes
        if (this.unityTimelineChart) {
            this.unityTimelineChart.destroy();
        }
        if (this.unityHeatmapChart) {
            this.unityHeatmapChart.destroy();
        }
        
        // Criar gráfico simples de linha
        this.unityTimelineChart = new Chart(timelineCanvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar'],
                datasets: [{
                    label: 'Teste',
                    data: [10, 20, 15],
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // Criar mapa de calor real usando canvas
        this.createHeatmapCanvas(heatmapCanvas);
    },
    
    // Atualizar visualização dos mapas
    updateHeatmapView() {
        if (!window.unitySoilData) return;
        
        const parametro = document.getElementById('unity-heatmap-parameter')?.value || 'ph';
        const periodo = document.getElementById('unity-heatmap-period')?.value || 'latest';
        
        const titulos = {
            'ph': 'pH do Solo',
            'umidade': 'Umidade',
            'temperatura': 'Temperatura',
            'condutividade': 'Condutividade',
            'salinidade': 'Salinidade',
            'npk': 'NPK Total',
            'score': 'Score Unity'
        };
        
        const timelineTitle = document.getElementById('unity-timeline-title');
        const heatmapTitle = document.getElementById('unity-heatmap-title');
        
        if (timelineTitle) {
            timelineTitle.textContent = `Evolução do ${titulos[parametro]} no Tempo`;
        }
        if (heatmapTitle) {
            heatmapTitle.textContent = `Mapa de Calor - ${titulos[parametro]}`;
        }
        
        // Filtrar dados por período
        let dadosFiltrados = window.unitySoilData;
        if (periodo !== 'all') {
            const agora = new Date();
            let dataLimite;
            
            switch(periodo) {
                case 'latest':
                    dadosFiltrados = [window.unitySoilData[0]];
                    break;
                case 'week':
                    dataLimite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    dataLimite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (dataLimite) {
                dadosFiltrados = window.unitySoilData.filter(item => {
                    const dataItem = new Date(item.timestamp);
                    return dataItem >= dataLimite;
                });
            }
        }
        
        const dadosTimeline = [];
        const dadosHeatmap = [];
        const cultivoData = {};
        
        dadosFiltrados.forEach(item => {
            const soilParams = item.soil_parameters || {};
            const gameMetrics = item.game_metrics || {};
            const cultivo = item.cultivo_atual || 'Cultivo N/A';
            const estacao = item.estacao || 'Plantio';
            
            let valor = 0;
            switch(parametro) {
                case 'ph':
                    valor = Number(soilParams.ph || 0);
                    break;
                case 'umidade':
                    valor = Number(soilParams.umidade || 0);
                    break;
                case 'temperatura':
                    valor = Number(soilParams.temperatura || 0);
                    break;
                case 'condutividade':
                    valor = Number(soilParams.condutividade || 0);
                    break;
                case 'salinidade':
                    valor = Number(soilParams.salinidade || 0);
                    break;
                case 'npk':
                    const nutrients = item.nutrients || {};
                    valor = (nutrients.nitrogenio || 0) + (nutrients.fosforo || 0) + (nutrients.potassio || 0);
                    break;
                case 'score':
                    valor = Number(gameMetrics.score || 0);
                    break;
            }
            
            // Dados para timeline
            dadosTimeline.push({
                x: new Date(item.timestamp),
                y: valor
            });
            
            // Dados para heatmap
            dadosHeatmap.push({
                x: cultivo,
                y: estacao,
                valor: valor,
                cultivo: cultivo,
                estacao: estacao,
                score: gameMetrics.score || 0,
                sustainability: gameMetrics.sustainability_index || 0
            });
            
            // Dados para análise por cultivo
            if (!cultivoData[cultivo]) cultivoData[cultivo] = [];
            cultivoData[cultivo].push(valor);
        });
        
        // Atualizar gráfico timeline
        if (this.unityTimelineChart && dadosTimeline.length > 0) {
            const labels = dadosTimeline.map((_, i) => `Sessão ${i+1}`);
            const valores = dadosTimeline.map(d => d.y);
            
            this.unityTimelineChart.data = {
                labels: labels,
                datasets: [{
                    label: titulos[parametro],
                    data: valores,
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            };
            
            this.unityTimelineChart.update();
        }
        

        

    },
    
    // Cores Unity por valor
    getUnityColorByValue(valor, parametro) {
        let cor = '#10B981'; // Verde (ideal)
        
        switch(parametro) {
            case 'ph':
                if (valor < 5.5 || valor > 7.5) cor = '#EF4444';
                else if (valor < 6.0 || valor > 7.0) cor = '#F59E0B';
                break;
            case 'umidade':
                if (valor < 30 || valor > 80) cor = '#EF4444';
                else if (valor < 40 || valor > 70) cor = '#F59E0B';
                break;
            case 'temperatura':
                if (valor < 15 || valor > 35) cor = '#EF4444';
                else if (valor < 20 || valor > 30) cor = '#F59E0B';
                break;
            case 'condutividade':
                if (valor > 2.0) cor = '#EF4444';
                else if (valor > 1.5) cor = '#F59E0B';
                break;
            case 'salinidade':
                if (valor > 800) cor = '#EF4444';
                else if (valor > 600) cor = '#F59E0B';
                break;
            case 'npk':
                if (valor < 100) cor = '#EF4444';
                else if (valor < 200) cor = '#F59E0B';
                break;
            case 'score':
                if (valor > 800) cor = '#10B981';
                else if (valor > 500) cor = '#F59E0B';
                else cor = '#EF4444';
                break;
        }
        
        return cor;
    },
    
    // Development Content
    loadDevelopmentContent(data) {
        document.getElementById('development-content').innerHTML = `
            <!-- Stack Tecnológico -->
            <div class="unity-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--gray-50), var(--white)); border-left: 4px solid var(--tech-blue);">
                <h3 style="color: var(--tech-blue); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.4rem;">
                    <i class="fas fa-layer-group"></i> Stack Tecnológico
                </h3>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem;">
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="background: linear-gradient(135deg, #3776ab, #4b8bbe); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i class="fab fa-python" style="font-size: 1.8rem;"></i>
                        </div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">Python</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">FastAPI + PyMongo</p>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="background: linear-gradient(135deg, #f7df1e, #f0db4f); color: #323330; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i class="fab fa-js-square" style="font-size: 1.8rem;"></i>
                        </div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">JavaScript</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">Vanilla + Chart.js</p>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="background: linear-gradient(135deg, #47a248, #4db33d); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i class="fas fa-leaf" style="font-size: 1.8rem;"></i>
                        </div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">MongoDB</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">Atlas Cloud</p>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="background: linear-gradient(135deg, #000000, #333333); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i class="fab fa-unity" style="font-size: 1.8rem;"></i>
                        </div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">Unity</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">Game Engine</p>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--white); border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--gray-200);">
                        <div style="background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i class="fas fa-robot" style="font-size: 1.8rem;"></i>
                        </div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">Llama 3.2</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">Ollama + Chatbot</p>
                    </div>
                </div>
            </div>
            
            <!-- Arquitetura do Sistema -->
            <div class="unity-info-grid" style="margin-bottom: 2rem;">
                <!-- Backend -->
                <div class="unity-card" style="border-left: 4px solid var(--secondary-green);">
                    <h3 style="color: var(--secondary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-server"></i> Backend Development
                    </h3>
                    <div>
                        <div class="unity-data-row">
                            <i class="fas fa-rocket"></i>
                            <span><strong>FastAPI:</strong> Framework web moderno e rápido</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-database"></i>
                            <span><strong>MongoDB Atlas:</strong> Banco NoSQL na nuvem</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-shield-alt"></i>
                            <span><strong>Autenticação:</strong> Sistema de acesso via ID</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-brain"></i>
                            <span><strong>IA:</strong> Análise de solo + Chatbot Llama 3.2</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-plug"></i>
                            <span><strong>Endpoints:</strong> 10 rotas REST</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-comments"></i>
                            <span><strong>Ollama:</strong> LLM local com streaming</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-database"></i>
                            <span><strong>RAG:</strong> Base local + Busca web + Clima</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-memory"></i>
                            <span><strong>Memória:</strong> SQLite persistente</span>
                        </div>
                    </div>
                </div>
                
                <!-- Frontend -->
                <div class="unity-card" style="border-left: 4px solid var(--tech-blue);">
                    <h3 style="color: var(--tech-blue); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-desktop"></i> Frontend Development
                    </h3>
                    <div>
                        <div class="unity-data-row">
                            <i class="fab fa-html5"></i>
                            <span><strong>HTML5:</strong> Estrutura semântica moderna</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fab fa-css3-alt"></i>
                            <span><strong>CSS3:</strong> Design responsivo + glassmorphism</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fab fa-js-square"></i>
                            <span><strong>JavaScript:</strong> Vanilla ES6+ modular</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-chart-bar"></i>
                            <span><strong>Chart.js:</strong> Visualizações interativas</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-mobile-alt"></i>
                            <span><strong>Responsivo:</strong> Desktop, tablet, mobile</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-icons"></i>
                            <span><strong>Font Awesome:</strong> Biblioteca de ícones</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-robot"></i>
                            <span><strong>Chatbot:</strong> Sessões isoladas + Histórico</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Localização:</strong> Botão clima INMET</span>
                        </div>
                        <div class="unity-data-row">
                            <i class="fas fa-lightbulb"></i>
                            <span><strong>Dicas IA:</strong> Popup com recomendações</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- API Endpoints -->
            <div class="unity-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--purple); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-code"></i> API Endpoints
                </h3>
                <div style="background: var(--gray-900); color: var(--gray-100); padding: 1.5rem; border-radius: 12px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; overflow-x: auto;">
                    <div style="margin-bottom: 1rem; color: var(--secondary-green);">// Principais endpoints da API</div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--tech-blue);">GET</span> <span style="color: var(--amber);">/unity/status</span> <span style="color: var(--gray-400);">// Status da API</span></div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--tech-blue);">GET</span> <span style="color: var(--amber);">/unity/login/{unity_id}</span> <span style="color: var(--gray-400);">// Login Unity</span></div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--secondary-green);">POST</span> <span style="color: var(--amber);">/unity/soil/save/{unity_id}</span> <span style="color: var(--gray-400);">// Salvar dados</span></div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--tech-blue);">GET</span> <span style="color: var(--amber);">/unity/dashboard/{unity_id}</span> <span style="color: var(--gray-400);">// Dashboard</span></div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--tech-blue);">GET</span> <span style="color: var(--amber);">/unity/analise-ia/{unity_id}</span> <span style="color: var(--gray-400);">// Análise IA</span></div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--secondary-green);">POST</span> <span style="color: var(--amber);">/api/chat/{unity_id}</span> <span style="color: var(--gray-400);">// Chatbot Llama</span></div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--secondary-green);">POST</span> <span style="color: var(--amber);">/api/generate_title</span> <span style="color: var(--gray-400);">// Títulos IA</span></div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--secondary-green);">POST</span> <span style="color: var(--amber);">/api/soil-tips/{unity_id}</span> <span style="color: var(--gray-400);">// Dicas solo</span></div>
                    <div style="margin-bottom: 0.5rem;"><span style="color: var(--tech-blue);">GET</span> <span style="color: var(--amber);">/unity/monitoring/{unity_id}</span> <span style="color: var(--gray-400);">// Monitoramento</span></div>
                </div>
            </div>
            
            <!-- Métricas de Desenvolvimento -->
            <div class="unity-card">
                <h3 style="color: var(--orange); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-line"></i> Métricas de Desenvolvimento
                </h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; border: 2px solid var(--secondary-green);">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-green); margin-bottom: 0.5rem;">5K+</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Linhas de Código</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; border: 2px solid var(--tech-blue);">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--tech-blue); margin-bottom: 0.5rem;">25+</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Arquivos Desenvolvidos</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; border: 2px solid var(--purple);">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--purple); margin-bottom: 0.5rem;">11</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Endpoints API REST</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; border: 2px solid var(--orange);">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--orange); margin-bottom: 0.5rem;">8</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Seções Dashboard</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
                    <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; border: 2px solid var(--cyan);">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--cyan); margin-bottom: 0.5rem;">9</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Parâmetros IA</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; border: 2px solid var(--pink);">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--pink); margin-bottom: 0.5rem;">2</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Collections MongoDB</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; border: 2px solid var(--indigo);">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--indigo); margin-bottom: 0.5rem;">100%</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Responsivo</div>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; border: 2px solid var(--amber);">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--amber); margin-bottom: 0.5rem;">3</div>
                        <div style="font-size: 0.9rem; color: var(--gray-600); font-weight: 500;">Plataformas (Win/Linux/Mac)</div>
                    </div>
                </div>
            </div>
            
            <!-- Serviços AWS -->
            <div class="unity-card" style="margin-top: 2rem;">
                <h3 style="color: var(--secondary-green); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fab fa-aws" style="color: var(--orange);"></i> Serviços AWS Utilizados
                </h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
                    <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,153,0,0.1), rgba(255,153,0,0.05)); border-radius: 12px; border: 2px solid rgba(255,153,0,0.2);">
                        <div style="background: linear-gradient(135deg, #FF9900, #FF6600); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i class="fas fa-robot" style="font-size: 1.5rem;"></i>
                        </div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">Amazon Q Developer</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">Agente de código IA</p>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,153,0,0.1), rgba(255,153,0,0.05)); border-radius: 12px; border: 2px solid rgba(255,153,0,0.2);">
                        <div style="background: linear-gradient(135deg, #FF9900, #FF6600); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i class="fas fa-cloud" style="font-size: 1.5rem;"></i>
                        </div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">Cloud Ready</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">Arquitetura preparada</p>
                    </div>
                    <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,153,0,0.1), rgba(255,153,0,0.05)); border-radius: 12px; border: 2px solid rgba(255,153,0,0.2);">
                        <div style="background: linear-gradient(135deg, #FF9900, #FF6600); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                            <i class="fas fa-rocket" style="font-size: 1.5rem;"></i>
                        </div>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">Escalabilidade</h4>
                        <p style="color: var(--gray-600); font-size: 0.9rem;">Deploy otimizado</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Monitoramento Real Time Content
    loadMonitoringContent(data) {
        console.log('Carregando seção de monitoramento...');
        console.log('MonitoringModule disponível:', typeof MonitoringModule !== 'undefined');
        
        // Usar o módulo de monitoramento
        if (typeof MonitoringModule !== 'undefined') {
            console.log('Inicializando MonitoringModule...');
            MonitoringModule.init();
        } else {
            console.error('MonitoringModule não encontrado!');
            document.getElementById('monitoring-content').innerHTML = `
                <div class="unity-card">
                    <h3 style="color: var(--secondary-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-satellite-dish"></i> Monitoramento em Tempo Real
                    </h3>
                    <div style="text-align: center; padding: 3rem; background: var(--gray-50); border-radius: 12px;">
                        <i class="fas fa-broadcast-tower" style="font-size: 3rem; color: var(--secondary-green); margin-bottom: 1rem;"></i>
                        <h4 style="color: var(--gray-800); margin-bottom: 0.5rem;">Módulo não carregado</h4>
                        <p style="color: var(--gray-600);">Erro ao carregar o módulo de monitoramento.</p>
                        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--secondary-green); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-redo"></i> Recarregar Página
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    // Criar mapa de calor funcional
    createHeatmapCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 300;
        
        // Criar gradiente de cores
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#10B981'); // Verde
        gradient.addColorStop(0.5, '#F59E0B'); // Amarelo
        gradient.addColorStop(1, '#EF4444'); // Vermelho
        
        // Desenhar mapa de calor simulado
        for (let x = 0; x < 400; x += 20) {
            for (let y = 0; y < 300; y += 20) {
                const intensity = Math.random();
                if (intensity > 0.7) {
                    ctx.fillStyle = '#EF4444';
                } else if (intensity > 0.4) {
                    ctx.fillStyle = '#F59E0B';
                } else {
                    ctx.fillStyle = '#10B981';
                }
                ctx.fillRect(x, y, 18, 18);
            }
        }
    },
    
    showEmpty(elementId, message = 'Nenhum dado encontrado') {
        this.showError(elementId, message);
    },
    
    async showSoilTips(parametro, valor, nomeParametro) {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;';
        modal.innerHTML = `
            <div style="background:white;border-radius:16px;padding:2rem;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                    <h3 style="color:var(--gray-800);margin:0;display:flex;align-items:center;gap:0.5rem;">
                        <i class="fas fa-lightbulb" style="color:var(--secondary-green);"></i>
                        Dicas para ${nomeParametro}
                    </h3>
                    <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--gray-600);">&times;</button>
                </div>
                <div style="background:var(--gray-50);padding:1rem;border-radius:8px;margin-bottom:1rem;">
                    <strong>Valor atual:</strong> ${valor}
                </div>
                <div id="tips-content" style="color:var(--gray-700);line-height:1.6;">
                    <i class="fas fa-spinner fa-spin"></i> Gerando dicas...
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        try {
            const response = await fetch(`${this.baseUrl}/api/soil-tips/${this.currentUnityId}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({parametro: nomeParametro, valor: valor, cultivo: this.currentUserData?.profile?.propriedade?.cultivo_principal || 'cultivo geral'})
            });
            const data = await response.json();
            document.getElementById('tips-content').innerHTML = data.tips.replace(/\n/g, '<br>');
        } catch (error) {
            document.getElementById('tips-content').innerHTML = 'Erro ao carregar dicas. Tente novamente.';
        }
    }
};

// Global Functions
function showSection(sectionId, clickedElement) {
    UnityDashboard.showSection(sectionId, clickedElement);
}

function logout() {
    UnityDashboard.logout();
}

function refreshData() {
    UnityDashboard.refreshData();
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        });
        
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
        
        // Fechar sidebar ao clicar em item de navegação (mobile)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }
});

// Initialize
UnityDashboard.init();