// Monitoramento Real Time - JavaScript Modular

const MonitoringModule = {
    // Configurações
    config: {
        updateInterval: 30000, // 30 segundos
        baseUrl: "http://127.0.0.1:8002"
    },
    
    // Estado atual
    state: {
        currentPeriod: '24h',
        isUpdating: false,
        lastUpdate: null
    },
    
    // Dados reais do banco de dados
    realData: [],
    
    // Inicialização
    init() {
        this.renderMonitoringSection();
        this.bindEvents();
        this.startAutoUpdate();
        this.updateLastUpdateTime();
    },
    
    // Renderizar seção completa
    renderMonitoringSection() {
        const container = document.getElementById('monitoring-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="monitoring-container">
                <!-- Header Principal -->
                <div class="unity-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--gray-50), var(--white)); border-left: 4px solid var(--secondary-green);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <p style="color: var(--gray-600); margin: 0; font-size: 1rem; flex: 1;">Acompanhe todos os parâmetros do solo, correlações automáticas e alertas inteligentes</p>
                        
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="background: var(--white); padding: 0.75rem 1.5rem; border-radius: 12px; border: 1px solid var(--gray-200); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-clock" style="color: var(--secondary-green);"></i>
                                    <select id="period-select" style="border: none; background: none; font-weight: 600; color: var(--gray-800); cursor: pointer;">
                                        <option value="1h">Última hora</option>
                                        <option value="6h">Últimas 6 horas</option>
                                        <option value="24h" selected>Últimas 24 horas</option>
                                        <option value="7d">Últimos 7 dias</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button class="btn-update" id="update-btn" style="background: var(--secondary-green); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                                <i class="fas fa-sync-alt"></i> Atualizar
                            </button>
                            
                            <button class="btn-export" id="export-btn" style="background: var(--tech-blue); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                                <i class="fas fa-file-pdf"></i> Exportar PDF
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Cards de Métricas -->
                <div class="metrics-grid" id="metrics-grid">
                    <!-- Será preenchido dinamicamente -->
                </div>
                
                <!-- Seção de Correlações -->
                <div class="correlations-section">
                    <div class="correlations-header">
                        <h3 class="correlations-title">
                            <i class="fas fa-project-diagram"></i>
                            Correlações Automáticas
                        </h3>
                        <button class="btn-update" onclick="MonitoringModule.updateCorrelations()" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
                            <i class="fas fa-sync-alt"></i>
                            Recalcular
                        </button>
                    </div>
                    
                    <div class="correlation-stats" id="correlation-stats">
                        <!-- Será preenchido dinamicamente -->
                    </div>
                    
                    <div class="correlations-grid" id="correlations-grid">
                        <!-- Será preenchido dinamicamente -->
                    </div>
                </div>
                
                <!-- Tabela de Dados -->
                <div class="data-table-container">
                    <div class="table-header">
                        <h3 class="table-title">
                            <i class="fas fa-table"></i>
                            Dados por Hora - Últimas 24h
                        </h3>
                        <span class="table-info" id="table-info">
                            ${this.realData.length} registros • Atualizado <span id="last-update">agora</span>
                        </span>
                    </div>
                    
                    <table class="monitoring-table">
                        <thead>
                            <tr>
                                <th><i class="fas fa-clock"></i> Hora</th>
                                <th><i class="fas fa-flask"></i> pH</th>
                                <th><i class="fas fa-tint"></i> Umidade</th>
                                <th><i class="fas fa-thermometer-half"></i> Temp</th>
                                <th><i class="fas fa-water"></i> Salinidade</th>
                                <th><i class="fas fa-bolt"></i> Condutividade</th>
                                <th><i class="fas fa-leaf"></i> N</th>
                                <th><i class="fas fa-seedling"></i> P</th>
                                <th><i class="fas fa-tree"></i> K</th>
                                <th><i class="fas fa-check-circle"></i> Status</th>
                            </tr>
                        </thead>
                        <tbody id="data-table-body">
                            <!-- Será preenchido dinamicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.updateMetrics();
        this.updateTable();
        this.updateCorrelations();
    },
    
    // Atualizar cards de métricas
    updateMetrics() {
        const metricsGrid = document.getElementById('metrics-grid');
        if (!metricsGrid) return;
        
        const metrics = this.calculateMetrics();
        const hasData = this.realData.length > 0;
        
        metricsGrid.innerHTML = `
            <div class="metric-card">
                <div class="metric-icon ${hasData ? 'green' : 'gray'}">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="metric-content">
                    <h3>pH ${metrics.avgPh}</h3>
                    <div class="metric-label">Média do Período</div>
                    <div class="metric-status ${hasData ? 'green' : 'gray'}">
                        <i class="fas fa-${hasData ? 'chart-line' : 'minus'}"></i> ${hasData ? 'Calculado' : 'Sem dados'}
                    </div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon ${hasData ? (metrics.alertas > 0 ? 'orange' : 'green') : 'gray'}">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="metric-content">
                    <h3>${metrics.alertas}</h3>
                    <div class="metric-label">Alertas Ativos</div>
                    <div class="metric-status ${hasData ? (metrics.alertas > 0 ? 'orange' : 'green') : 'gray'}">
                        <i class="fas fa-${hasData ? (metrics.alertas > 0 ? 'exclamation-triangle' : 'check') : 'minus'}"></i> ${hasData ? (metrics.alertas > 0 ? 'Atenção' : 'OK') : 'Sem dados'}
                    </div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon ${hasData ? 'blue' : 'gray'}">
                    <i class="fas fa-heart"></i>
                </div>
                <div class="metric-content">
                    <h3>${metrics.saudeGeral}%</h3>
                    <div class="metric-label">Saúde do Solo</div>
                    <div class="metric-status ${hasData ? 'blue' : 'gray'}">
                        <i class="fas fa-${hasData ? 'thumbs-up' : 'minus'}"></i> ${hasData ? (metrics.saudeGeral > 70 ? 'Bom' : 'Regular') : 'Sem dados'}
                    </div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon ${hasData ? 'purple' : 'gray'}">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="metric-content">
                    <h3>${metrics.ultimaLeitura}</h3>
                    <div class="metric-label">Última Leitura</div>
                    <div class="metric-status ${hasData ? 'purple' : 'gray'}">
                        <i class="fas fa-${hasData ? 'history' : 'minus'}"></i> ${hasData ? 'Disponível' : 'Sem dados'}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Atualizar tabela
    updateTable() {
        const tableBody = document.getElementById('data-table-body');
        if (!tableBody) return;
        
        const filteredData = this.getFilteredData();
        const periodText = {
            '1h': 'Última hora',
            '6h': 'Últimas 6 horas', 
            '24h': 'Últimas 24h',
            '7d': 'Últimos 7 dias'
        };
        
        // Atualizar título da tabela
        const tableTitle = document.querySelector('.table-title');
        if (tableTitle) {
            tableTitle.innerHTML = `
                <i class="fas fa-table"></i>
                Dados por Hora - ${periodText[this.state.currentPeriod] || 'Período'}
            `;
        }
        
        // Atualizar info da tabela
        const tableInfo = document.getElementById('table-info');
        if (tableInfo) {
            tableInfo.innerHTML = `
                ${filteredData.length} registros • Atualizado <span id="last-update">agora</span>
            `;
        }
        
        // Verificar se há dados
        if (filteredData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 3rem; color: var(--gray-600);">
                        <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <strong>Nenhum dado encontrado</strong><br>
                        <small>Não há dados de solo disponíveis para este período</small>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = filteredData.map(row => `
            <tr>
                <td><strong>${row.hora}</strong></td>
                <td>${row.ph}</td>
                <td>${row.umidade}%</td>
                <td>${row.temp}°C</td>
                <td>${row.salinidade} ppm</td>
                <td>${row.condutividade} dS/m</td>
                <td>${row.n} mg/kg</td>
                <td>${row.p} mg/kg</td>
                <td>${row.k} mg/kg</td>
                <td>
                    <span class="status-badge status-${row.status}">
                        <i class="fas fa-${row.status === 'ideal' ? 'check-circle' : row.status === 'atencao' ? 'exclamation-triangle' : 'times-circle'}"></i>
                        ${row.status === 'ideal' ? 'Ideal' : row.status === 'atencao' ? 'Atenção' : 'Crítico'}
                    </span>
                </td>
            </tr>
        `).join('');
    },
    
    // Calcular métricas
    calculateMetrics() {
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            return { 
                avgPh: '0.0', 
                alertas: 0, 
                saudeGeral: 0, 
                ultimaLeitura: 'N/A' 
            };
        }
        
        const avgPh = (filteredData.reduce((sum, item) => sum + item.ph, 0) / filteredData.length).toFixed(1);
        const alertas = filteredData.filter(item => item.status !== 'ideal').length;
        const saudeGeral = Math.round((filteredData.filter(item => item.status === 'ideal').length / filteredData.length) * 100);
        const ultimaLeitura = this.realData[0]?.hora || 'N/A';
        
        return { avgPh, alertas, saudeGeral, ultimaLeitura };
    },
    
    // Vincular eventos
    bindEvents() {
        // Botão atualizar
        document.addEventListener('click', (e) => {
            if (e.target.closest('#update-btn')) {
                this.updateData();
            }
            
            if (e.target.closest('#export-btn')) {
                this.exportPDF();
            }
        });
        
        // Selects de filtro
        document.addEventListener('change', (e) => {
            if (e.target.id === 'period-select') {
                this.state.currentPeriod = e.target.value;
                this.updateData();
            }
            

        });
    },
    
    // Obter Unity ID do localStorage ou dashboard
    getCurrentUserId() {
        // Tentar pegar do dashboard primeiro (se estiver integrado)
        if (window.currentUnityId) {
            return window.currentUnityId;
        }
        
        // Tentar pegar do localStorage (chave unity_id)
        const storedId = localStorage.getItem('unity_id');
        if (storedId && storedId !== 'unity_default' && storedId !== 'unity_test123') {
            return storedId;
        }
        
        // Tentar pegar do localStorage (chave unityId - dashboard)
        const dashboardId = localStorage.getItem('unityId');
        if (dashboardId) {
            return dashboardId;
        }
        
        // Tentar pegar do sessionStorage (usado pelo dashboard)
        const sessionId = sessionStorage.getItem('unity_id');
        if (sessionId) {
            return sessionId;
        }
        
        // Fallback para teste
        console.warn('Unity ID não encontrado, usando ID de teste');
        return 'unity_bf87c29494e0';  // Usar ID que sabemos que funciona
    },
    
    // Atualizar dados
    async updateData() {
        if (this.state.isUpdating) return;
        
        this.state.isUpdating = true;
        const updateBtn = document.getElementById('update-btn');
        if (updateBtn) {
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
            updateBtn.disabled = true;
        }
        
        try {
            const unityId = this.getCurrentUserId();
            console.log('Buscando dados para Unity ID:', unityId);
            
            const apiUrl = `${this.config.baseUrl}/unity/monitoring/${unityId}?period=${this.state.currentPeriod}`;
            console.log('URL da API:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Dados recebidos:', result.data?.length || 0, 'registros');
                
                if (result.status === 'success' && result.data && result.data.length > 0) {
                    this.realData = result.data;
                    console.log('Dados carregados com sucesso:', this.realData.length, 'registros');
                } else {
                    this.realData = [];
                    console.warn('Nenhum dado encontrado no banco de dados para o ID:', unityId);
                }
            } else {
                const errorText = await response.text();
                console.error('Erro HTTP:', response.status, errorText);
                this.realData = [];
            }
            
            this.updateMetrics();
            this.updateTable();
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            this.realData = [];
            this.updateMetrics();
            this.updateTable();
            this.updateLastUpdateTime();
        } finally {
            this.state.isUpdating = false;
            if (updateBtn) {
                updateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
                updateBtn.disabled = false;
            }
        }
    },
    
    // Filtrar dados por período
    getFilteredData() {
        // Os dados já vêm filtrados da API baseado no período
        return this.realData || [];
    },
    
    // Exportar PDF da tabela de monitoramento
    exportPDF() {
        const filteredData = this.getFilteredData();
        if (filteredData.length === 0) {
            alert('Nenhum dado disponível para exportar');
            return;
        }
        
        const unityId = this.getCurrentUserId();
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR');
        
        const periodText = {
            '1h': 'Última hora',
            '6h': 'Últimas 6 horas', 
            '24h': 'Últimas 24 horas',
            '7d': 'Últimos 7 dias'
        };
        
        // Criar documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        
        // Cabeçalho melhorado
        doc.setFontSize(28);
        doc.setTextColor(22, 101, 52); // Verde escuro profissional
        doc.setFont('helvetica', 'bold');
        const titleText = 'EKKO';
        const titleWidth = doc.getTextWidth(titleText);
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(titleText, titleX, 18);
        
        doc.setFontSize(14);
        doc.setTextColor(55, 65, 81); // Cinza escuro
        doc.setFont('helvetica', 'normal');
        const subtitleText = 'Relatório de Monitoramento Agrícola';
        const subtitleWidth = doc.getTextWidth(subtitleText);
        const subtitleX = (pageWidth - subtitleWidth) / 2;
        doc.text(subtitleText, subtitleX, 26);
        
        // Linha decorativa
        doc.setDrawColor(22, 101, 52);
        doc.setLineWidth(1.5);
        doc.line(margin, 32, pageWidth - margin, 32);
        
        // Metadados
        doc.setFontSize(11);
        doc.setTextColor(75, 85, 99); // Cinza médio
        doc.setFont('helvetica', 'normal');
        doc.text(`Data de Exportação: ${dataAtual} às ${horaAtual}`, margin, 44);
        doc.text(`ID do usuário: ${unityId}`, margin, 51);
        doc.text(`Período: ${periodText[this.state.currentPeriod]}`, margin, 58);
        doc.text(`Total de Registros: ${filteredData.length}`, margin, 65);
        
        // Calcular métricas para resumo
        const metrics = this.calculateMetrics();
        
        // Resumo estatístico
        doc.setFontSize(16);
        doc.setTextColor(22, 101, 52); // Verde escuro
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo Estatístico', margin, 79);
        
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55); // Cinza muito escuro
        doc.setFont('helvetica', 'normal');
        doc.text(`• pH Médio: ${metrics.avgPh}`, margin + 5, 89);
        doc.text(`• Alertas Ativos: ${metrics.alertas}`, margin + 5, 96);
        doc.text(`• Saúde Geral: ${metrics.saudeGeral}%`, margin + 5, 103);
        doc.text(`• Última Leitura: ${metrics.ultimaLeitura}`, margin + 5, 110);
        
        // Preparar dados da tabela
        const tableHeaders = [
            'Hora', 'pH', 'Umid\n(%)', 'T\n(°C)', 
            'Sal\n(ppm)', 'Cond\n(dS/m)', 
            'N\n(mg/kg)', 'P\n(mg/kg)', 'K\n(mg/kg)', 'Status'
        ];
        
        const tableData = filteredData.map(row => [
            row.hora,
            row.ph.toString().replace('.', ','),
            row.umidade.toString().replace('.', ','),
            row.temp.toString().replace('.', ','),
            row.salinidade.toString().replace('.', ','),
            row.condutividade.toString().replace('.', ','),
            row.n.toString().replace('.', ','),
            row.p.toString().replace('.', ','),
            row.k.toString().replace('.', ','),
            row.status === 'ideal' ? 'Ideal' : row.status === 'atencao' ? 'Atenção' : 'Crítico'
        ]);
        
        // Gerar tabela com larguras otimizadas
        doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: 119,
            margin: { left: 10, right: 10 },
            tableWidth: 'auto',
            styles: {
                fontSize: 9,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                lineColor: [200, 200, 200],
                lineWidth: 0.5
            },
            headStyles: {
                fillColor: [22, 101, 52], // Verde escuro
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 10,
                halign: 'center',
                cellPadding: 5
            },
            bodyStyles: {
                textColor: [31, 41, 55], // Cinza escuro
                fontSize: 9
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] 
            },
            columnStyles: {
                0: { // Horário
                    cellWidth: 18,
                    halign: 'center',
                    fontStyle: 'bold',
                    fontSize: 8
                },
                1: { // pH
                    cellWidth: 15,
                    halign: 'center'
                },
                2: { // Umidade
                    cellWidth: 20,
                    halign: 'center'
                },
                3: { // Temperatura
                    cellWidth: 18,
                    halign: 'center'
                },
                4: { // Salinidade
                    cellWidth: 22,
                    halign: 'center'
                },
                5: { // Condutividade
                    cellWidth: 21,
                    halign: 'center'
                },
                6: { // Nitrogênio
                    cellWidth: 18,
                    halign: 'center'
                },
                7: { // Fósforo
                    cellWidth: 18,
                    halign: 'center'
                },
                8: { // Potássio
                    cellWidth: 18,
                    halign: 'center'
                },
                9: { // Status
                    cellWidth: 22,
                    halign: 'center',
                    fontStyle: 'bold'
                }
            },
            didParseCell: function(data) {
                // Colorir status
                if (data.column.index === 9 && data.section === 'body') {
                    const status = data.cell.raw;
                    if (status === 'Ideal') {
                        data.cell.styles.textColor = [34, 197, 94]; // Verde
                        data.cell.styles.fillColor = [240, 253, 244]; // Fundo verde claro
                    } else if (status === 'Atenção') {
                        data.cell.styles.textColor = [249, 115, 22]; // Laranja
                        data.cell.styles.fillColor = [255, 247, 237]; // Fundo laranja claro
                    } else if (status === 'Crítico') {
                        data.cell.styles.textColor = [239, 68, 68]; // Vermelho
                        data.cell.styles.fillColor = [254, 242, 242]; // Fundo vermelho claro
                    }
                }
                
                // Destacar horário
                if (data.column.index === 0 && data.section === 'body') {
                    data.cell.styles.fillColor = [245, 245, 245]; // Fundo cinza para horário
                }
            }
        });
        
        // Rodapé
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128); // Cinza médio
        doc.setFont('helvetica', 'normal');
        const footerText = 'Gerado por EKKO - Agricultura de Precisão | ETE FMC - Santa Rita do Sapucaí, MG';
        const textWidth = doc.getTextWidth(footerText);
        const centerX = (pageWidth - textWidth) / 2;
        doc.text(footerText, centerX, finalY);
        
        // Adicionar número da página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            doc.setFont('helvetica', 'normal');
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10);
        }
        
        // Salvar arquivo com nome mais profissional
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const fileName = `RelatorioMonitoramento_Ekko_${timestamp}.pdf`;
        doc.save(fileName);
        
        // Feedback visual
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-check"></i> PDF Gerado!';
            exportBtn.style.background = 'var(--secondary-green)';
            
            setTimeout(() => {
                exportBtn.innerHTML = originalText;
                exportBtn.style.background = 'var(--tech-blue)';
            }, 2000);
        }
    },
    
    // Atualizar tempo da última atualização
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = 'agora';
            this.state.lastUpdate = new Date();
        }
    },
    
    // Auto-atualização
    startAutoUpdate() {
        // Fazer primeira chamada imediatamente
        this.updateData();
        
        setInterval(() => {
            if (!this.state.isUpdating) {
                this.updateData();
            }
        }, this.config.updateInterval);
    },
    
    // Atualizar correlações
    updateCorrelations() {
        if (typeof CorrelationEngine === 'undefined') {
            console.warn('CorrelationEngine não carregado');
            return;
        }
        
        const filteredData = this.getFilteredData();
        
        // Verificar se há dados suficientes
        if (filteredData.length < 2) {
            const statsContainer = document.getElementById('correlation-stats');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="stat-item">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Correlações Encontradas</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Correlações Fortes</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Correlações Positivas</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Correlações Negativas</div>
                    </div>
                `;
            }
            
            const gridContainer = document.getElementById('correlations-grid');
            if (gridContainer) {
                gridContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: var(--gray-600);">
                        <i class="fas fa-project-diagram" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <strong>Dados insuficientes</strong><br>
                        <small>São necessários pelo menos 2 registros para calcular correlações</small>
                    </div>
                `;
            }
            return;
        }
        
        const correlations = CorrelationEngine.analyzeCorrelations(filteredData);
        
        // Atualizar estatísticas
        const statsContainer = document.getElementById('correlation-stats');
        if (statsContainer) {
            const totalCorrelations = correlations.length;
            const strongCorrelations = correlations.filter(c => c.strength === 'forte' || c.strength === 'muito_forte').length;
            const positiveCorrelations = correlations.filter(c => c.direction === 'positive').length;
            
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${totalCorrelations}</div>
                    <div class="stat-label">Correlações Encontradas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${strongCorrelations}</div>
                    <div class="stat-label">Correlações Fortes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${positiveCorrelations}</div>
                    <div class="stat-label">Correlações Positivas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${correlations.length - positiveCorrelations}</div>
                    <div class="stat-label">Correlações Negativas</div>
                </div>
            `;
        }
        
        // Atualizar grid de correlações
        const gridContainer = document.getElementById('correlations-grid');
        if (gridContainer) {
            gridContainer.innerHTML = CorrelationEngine.renderCorrelationCards(correlations);
        }
    },
    
    // Destruir módulo
    destroy() {
        // Limpar intervalos e eventos se necessário
    }
};

// Exportar para uso global
window.MonitoringModule = MonitoringModule;