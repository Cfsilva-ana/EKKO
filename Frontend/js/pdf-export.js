// Módulo de Exportação de PDF Otimizado
const PDFExporter = {
    async exportarRelatorio() {
        UnityDashboard.showMessage('Gerando relatório...', 'success', 0);
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const userData = UnityDashboard.currentUserData;
        if (!userData) {
            alert('Nenhum dado disponível');
            return;
        }

        const profile = userData.profile || {};
        const soilData = userData.latest_soil_data || {};
        const soilParams = soilData.soil_parameters || {};
        const nutrients = soilData.nutrients || {};
        const gameMetrics = soilData.game_metrics || {};
        
        // Página 1: Capa
        this.criarCapa(doc, profile);
        
        // Página 2: Resumo + Ações
        doc.addPage();
        this.criarResumo(doc, soilParams, nutrients);
        
        // Página 3-8: Análise por Parâmetro (com gráficos integrados)
        await this.criarAnalises(doc, soilParams, nutrients);
        
        // Página 9: Produtos
        doc.addPage();
        this.criarProdutos(doc, soilParams, nutrients);
        
        this.adicionarRodape(doc);
        
        const nome = `EKKO_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nome);
        
        UnityDashboard.showMessage('PDF exportado!', 'success', 3000);
    },
    
    criarCapa(doc, profile) {
        // Gradiente verde
        for (let i = 0; i < 297; i++) {
            const opacity = 34 + (i / 297) * 30;
            doc.setFillColor(opacity, 197 - (i / 297) * 50, 94 - (i / 297) * 30);
            doc.rect(0, i, 210, 1, 'F');
        }
        
        // Logo EKKO
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(50);
        doc.setFont('helvetica', 'bold');
        doc.text('EKKO', 105, 80, { align: 'center' });
        
        // Linha decorativa
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(2);
        doc.line(60, 90, 150, 90);
        
        doc.setFontSize(22);
        doc.setFont('helvetica', 'normal');
        doc.text('Relatório de Análise de Solo', 105, 110, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Agricultura de Precisão', 105, 122, { align: 'center' });
        
        // Card branco
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(30, 145, 150, 80, 5, 5, 'F');
        
        // Sombra do card
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.roundedRect(30, 145, 150, 80, 5, 5, 'S');
        
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Informações do Produtor', 105, 160, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text('Produtor: ' + (profile.dados_pessoais?.nome || 'N/A'), 105, 175, { align: 'center' });
        doc.text('Propriedade: ' + (profile.propriedade?.nome || 'N/A'), 105, 188, { align: 'center' });
        doc.text('Area: ' + (profile.propriedade?.area_hectares || 0) + ' hectares', 105, 201, { align: 'center' });
        doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'), 105, 214, { align: 'center' });
        
        // Rodapé
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('ETE FMC - 45a Projete | Equipe 34DS08', 105, 270, { align: 'center' });
        doc.setFontSize(8);
        doc.text('Santa Rita do Sapucai, MG', 105, 278, { align: 'center' });
    },
    
    criarResumo(doc, soilParams, nutrients) {
        let y = 20;
        doc.setFontSize(18);
        doc.setTextColor(34, 197, 94);
        doc.text('Resumo Executivo', 20, y);
        y += 10;
        
        const analise = this.analisar(soilParams, nutrients);
        
        doc.autoTable({
            startY: y,
            head: [['Parametro', 'Valor', 'Status', 'Prioridade']],
            body: [
                ['pH', Number(soilParams.ph || 0).toFixed(2), analise.ph.status, analise.ph.prioridade],
                ['Umidade', Number(soilParams.umidade || 0).toFixed(1) + '%', analise.umidade.status, analise.umidade.prioridade],
                ['Temperatura', Number(soilParams.temperatura || 0).toFixed(1) + '°C', analise.temp.status, analise.temp.prioridade],
                ['Nitrogenio', Number(nutrients.nitrogenio || 0).toFixed(0) + ' mg/kg', analise.n.status, analise.n.prioridade],
                ['Fosforo', Number(nutrients.fosforo || 0).toFixed(0) + ' mg/kg', analise.p.status, analise.p.prioridade],
                ['Potassio', Number(nutrients.potassio || 0).toFixed(0) + ' mg/kg', analise.k.status, analise.k.prioridade]
            ],
            theme: 'grid',
            headStyles: { fillColor: [34, 197, 94] }
        });
        
        y = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68);
        doc.text('ACOES PRIORITARIAS:', 20, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        this.getAcoes(analise).forEach((acao, i) => {
            doc.text(`${i + 1}. ${acao}`, 25, y);
            y += 6;
        });
    },
    
    async criarAnalises(doc, soilParams, nutrients) {
        const params = [
            { nome: 'pH do Solo', val: soilParams.ph, tipo: 'ph', cor: '#22C55E' },
            { nome: 'Umidade', val: soilParams.umidade, tipo: 'umidade', cor: '#3B82F6' },
            { nome: 'Temperatura', val: soilParams.temperatura, tipo: 'temp', cor: '#F97316' },
            { nome: 'Nitrogenio (N)', val: nutrients.nitrogenio, tipo: 'n', cor: '#8B5CF6' },
            { nome: 'Fosforo (P)', val: nutrients.fosforo, tipo: 'p', cor: '#EC4899' },
            { nome: 'Potassio (K)', val: nutrients.potassio, tipo: 'k', cor: '#FBBF24' }
        ];
        
        for (const p of params) {
            doc.addPage();
            await this.criarPagParam(doc, p);
        }
    },
    
    async criarPagParam(doc, p) {
        let y = 20;
        
        // Header com gradiente colorido por parâmetro
        const rgb = this.hexToRgb(p.cor);
        for (let i = 0; i < 35; i++) {
            const factor = i / 35;
            doc.setFillColor(
                Math.floor(rgb.r * (1 - factor * 0.3)),
                Math.floor(rgb.g * (1 - factor * 0.3)),
                Math.floor(rgb.b * (1 - factor * 0.3))
            );
            doc.rect(0, i, 210, 1, 'F');
        }
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(p.nome, 105, 22, { align: 'center' });
        
        y = 45;
        
        // Card valor atual com sombra
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(15, y, 85, 35, 4, 4, 'F');
        doc.setDrawColor(rgb.r, rgb.g, rgb.b);
        doc.setLineWidth(2);
        doc.roundedRect(15, y, 85, 35, 4, 4, 'S');
        
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        const unidade = this.getUnidade(p.tipo);
        doc.text(`${Number(p.val || 0).toFixed(1)}${unidade}`, 57.5, y + 23, { align: 'center' });
        
        // Gráfico ao lado do valor
        await this.criarGraficoParam(doc, p, 110, y);
        
        y += 45;
        const dicas = this.getDicas(p.tipo, p.val);
        
        // Card Análise compacto
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, y, 180, 28, 3, 3, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, y, 180, 28, 3, 3, 'S');
        doc.setFontSize(11);
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.setFont('helvetica', 'bold');
        doc.text('ANALISE', 20, y + 7);
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');
        const analiseLines = doc.splitTextToSize(dicas.analise, 170);
        doc.text(analiseLines.slice(0, 3), 20, y + 14);
        y += 33;
        
        // Card Recomendação compacto
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, y, 180, 24, 3, 3, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, y, 180, 24, 3, 3, 'S');
        doc.setFontSize(11);
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text('RECOMENDACAO', 20, y + 7);
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');
        const recLines = doc.splitTextToSize(dicas.recomendacao, 170);
        doc.text(recLines.slice(0, 2), 20, y + 14);
        y += 29;
        
        // Card Correção compacto
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, y, 180, 24, 3, 3, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, y, 180, 24, 3, 3, 'S');
        doc.setFontSize(11);
        doc.setTextColor(139, 92, 246);
        doc.setFont('helvetica', 'bold');
        doc.text('COMO CORRIGIR', 20, y + 7);
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');
        const corrLines = doc.splitTextToSize(dicas.correcao, 170);
        doc.text(corrLines.slice(0, 2), 20, y + 14);
        y += 29;
        
        // Card Produtos compacto
        doc.setFillColor(255, 251, 245);
        doc.roundedRect(15, y, 180, 32, 3, 3, 'F');
        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(1);
        doc.roundedRect(15, y, 180, 32, 3, 3, 'S');
        doc.setFontSize(11);
        doc.setTextColor(249, 115, 22);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUTOS', 20, y + 7);
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');
        let py = y + 13;
        dicas.produtos.slice(0, 3).forEach(prod => {
            doc.text(`• ${prod}`, 22, py);
            py += 5;
        });
    },
    
    criarProdutos(doc, soilParams, nutrients) {
        let y = 20;
        doc.setFontSize(18);
        doc.setTextColor(34, 197, 94);
        doc.text('Produtos Recomendados', 20, y);
        y += 10;
        
        doc.autoTable({
            startY: y,
            head: [['Produto', 'Marca', 'Aplicação', 'Dosagem']],
            body: this.getProdutos(soilParams, nutrients),
            theme: 'grid',
            headStyles: { fillColor: [34, 197, 94] },
            styles: { fontSize: 9 }
        });
        
        y = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text('PLANO DE ACAO:', 20, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const plano = [
            '1. Analise laboratorial completa',
            '2. Corrigir pH antes de fertilizar',
            '3. Aplicar corretivos conforme recomendacao',
            '4. Monitorar umidade regularmente',
            '5. Adubacao de cobertura conforme cultura',
            '6. Registrar todas aplicacoes'
        ];
        plano.forEach(item => {
            doc.text(item, 25, y);
            y += 6;
        });
    },
    
    async criarGraficoParam(doc, p, x, y) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        canvas.style.position = 'absolute';
        canvas.style.left = '-9999px';
        canvas.style.top = '-9999px';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const rgb = this.hexToRgb(p.cor);
        
        // Criar gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, p.cor);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Atual', 'Ideal Min', 'Ideal Max'],
                datasets: [{
                    label: p.nome,
                    data: this.getValoresIdeais(p.tipo, p.val),
                    backgroundColor: [gradient, 'rgba(200,200,200,0.3)', 'rgba(200,200,200,0.3)'],
                    borderColor: [p.cor, '#999', '#999'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
        
        await new Promise(r => setTimeout(r, 200));
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, 85, 35);
        document.body.removeChild(canvas);
    },
    
    getValoresIdeais(tipo, val) {
        const ranges = {
            ph: [val, 6.0, 7.0],
            umidade: [val, 40, 70],
            temp: [val, 20, 30],
            n: [val, 150, 300],
            p: [val, 120, 250],
            k: [val, 150, 300]
        };
        return ranges[tipo] || [val, val * 0.8, val * 1.2];
    },
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 34, g: 197, b: 94 };
    },
    
    async criarGraficos_OLD(doc, soilParams, nutrients, gameMetrics) {
        let y = 20;
        doc.setFontSize(18);
        doc.setTextColor(34, 197, 94);
        doc.text('Graficos', 20, y);
        y += 15;
        
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 300;
        document.body.appendChild(canvas);
        
        new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['pH', 'Umidade', 'Temp', 'N', 'P', 'K'],
                datasets: [{
                    label: 'Valores',
                    data: [
                        (soilParams.ph || 0) * 10,
                        soilParams.umidade || 0,
                        soilParams.temperatura || 0,
                        (nutrients.nitrogenio || 0) / 10,
                        (nutrients.fosforo || 0) / 10,
                        (nutrients.potassio || 0) / 10
                    ],
                    backgroundColor: ['#22C55E', '#3B82F6', '#F97316', '#8B5CF6', '#EC4899', '#FBBF24']
                }]
            },
            options: { responsive: false }
        });
        
        await new Promise(r => setTimeout(r, 300));
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 20, y, 170, 80);
        document.body.removeChild(canvas);
        
        y += 90;
        const canvas2 = document.createElement('canvas');
        canvas2.width = 400;
        canvas2.height = 400;
        document.body.appendChild(canvas2);
        
        new Chart(canvas2.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Sustentabilidade', 'Saude', 'Eficiencia'],
                datasets: [{
                    data: [
                        gameMetrics.sustainability_index || 50,
                        gameMetrics.soil_health || 50,
                        Math.min(100, (gameMetrics.score || 0) / 10)
                    ],
                    backgroundColor: ['#22C55E', '#3B82F6', '#8B5CF6']
                }]
            },
            options: { responsive: false }
        });
        
        await new Promise(r => setTimeout(r, 300));
        doc.addImage(canvas2.toDataURL('image/png'), 'PNG', 40, y, 130, 130);
        document.body.removeChild(canvas2);
    },
    
    adicionarRodape(doc) {
        const total = doc.internal.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            doc.setPage(i);
            
            // Linha decorativa
            doc.setDrawColor(34, 197, 94);
            doc.setLineWidth(0.5);
            doc.line(20, 285, 190, 285);
            
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text('Pagina ' + i + ' de ' + total, 105, 290, { align: 'center' });
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text('EKKO', 20, 290);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text('ETE FMC', 190, 290, { align: 'right' });
        }
    },
    
    analisar(sp, n) {
        return {
            ph: { status: this.getSt(sp.ph, 6, 7), prioridade: sp.ph < 5.5 || sp.ph > 7.5 ? 'ALTA' : sp.ph < 6 || sp.ph > 7 ? 'MÉDIA' : 'BAIXA' },
            umidade: { status: this.getSt(sp.umidade, 40, 70), prioridade: sp.umidade < 30 || sp.umidade > 80 ? 'ALTA' : 'MÉDIA' },
            temp: { status: this.getSt(sp.temperatura, 20, 30), prioridade: 'BAIXA' },
            n: { status: n.nitrogenio > 200 ? '✓' : n.nitrogenio > 100 ? '⚠' : '❌', prioridade: n.nitrogenio < 100 ? 'ALTA' : 'MÉDIA' },
            p: { status: n.fosforo > 150 ? '✓' : n.fosforo > 80 ? '⚠' : '❌', prioridade: n.fosforo < 80 ? 'ALTA' : 'MÉDIA' },
            k: { status: n.potassio > 180 ? '✓' : n.potassio > 100 ? '⚠' : '❌', prioridade: n.potassio < 100 ? 'ALTA' : 'MÉDIA' }
        };
    },
    
    getAcoes(a) {
        const acoes = [];
        if (a.ph.prioridade === 'ALTA') acoes.push('Corrigir pH com calcario ou enxofre');
        if (a.n.prioridade === 'ALTA') acoes.push('Aplicar Ureia 100-200 kg/ha');
        if (a.p.prioridade === 'ALTA') acoes.push('Aplicar Superfosfato 300-500 kg/ha');
        if (a.k.prioridade === 'ALTA') acoes.push('Aplicar KCl 100-200 kg/ha');
        if (a.umidade.prioridade === 'ALTA') acoes.push('Ajustar irrigacao');
        return acoes.length ? acoes : ['Solo em boas condicoes'];
    },
    
    getDicas(tipo, val) {
        const dicas = {
            ph: {
                analise: `O pH ${Number(val).toFixed(2)} indica solo ${val < 5.5 ? 'muito ácido' : val < 6.0 ? 'ácido' : val > 7.5 ? 'muito alcalino' : val > 7.0 ? 'alcalino' : 'ideal'}. ${val < 6.0 ? 'Solos ácidos limitam a disponibilidade de nutrientes essenciais como fósforo, cálcio e magnésio, além de aumentar a toxidez de alumínio e manganês.' : val > 7.0 ? 'Solos alcalinos reduzem a disponibilidade de micronutrientes como ferro, manganês, zinco e cobre, causando clorose e deficiências nutricionais.' : 'Faixa ideal para a maioria das culturas, permitindo máxima disponibilidade de nutrientes e atividade microbiana benéfica.'}`,
                recomendacao: val < 6.0 ? 'Realizar calagem com calcário dolomítico (PRNT mínimo 80%). Aplicar 60-90 dias antes do plantio para reação completa. Incorporar até 20cm de profundidade.' : val > 7.0 ? 'Aplicar enxofre elementar ou gesso agrícola. Monitorar pH a cada 3 meses. Evitar adubações alcalinizantes.' : 'Manter pH atual com monitoramento semestral. Realizar calagem de manutenção se necessário (0.5-1 ton/ha).',
                correcao: val < 5.5 ? 'CORREÇÃO URGENTE: Calcário Dolomítico PRNT 80%: 3-5 ton/ha. Aplicar em duas etapas: 60% antes da aragem e 40% antes da gradagem. Aguardar 60-90 dias para plantio.' : val < 6.0 ? 'Calcário Dolomítico PRNT 80%: 2-3 ton/ha. Aplicar 60 dias antes do plantio. Incorporar com grade niveladora.' : val > 7.5 ? 'CORREÇÃO URGENTE: Enxofre Elementar 90%: 300-500 kg/ha + Gesso Agrícola: 1-2 ton/ha. Aplicar em cobertura e irrigar.' : val > 7.0 ? 'Enxofre Elementar 90%: 200-300 kg/ha. Aplicar e incorporar levemente. Monitorar mensalmente.' : 'Manutenção: Calcário 0.5-1 ton/ha a cada 2-3 anos conforme análise de solo.',
                produtos: val < 6.0 ? ['Calcario Dolomitico PRNT 80% (Yara/Mosaic) - 2-5 ton/ha', 'Calcario Calcitico PRNT 85% (Mosaic) - 2-4 ton/ha', 'Calcario Liquido (Stoller) - 5-10 L/ha foliar'] : val > 7.0 ? ['Enxofre Elementar 90% (Mosaic/Timac) - 200-500 kg/ha', 'Gesso Agricola (Mosaic) - 1-2 ton/ha', 'Acido Sulfurico diluido (uso tecnico) - conforme orientacao'] : ['Calcario Dolomitico (manutencao) - 0.5-1 ton/ha', 'Analise de solo semestral']
            },
            umidade: {
                analise: `Umidade de ${Number(val).toFixed(1)}% está ${val < 30 ? 'criticamente baixa' : val < 40 ? 'baixa' : val > 80 ? 'excessiva' : val > 70 ? 'alta' : 'ideal'}. ${val < 40 ? 'Umidade insuficiente causa estresse hídrico, redução da fotossíntese, murcha das plantas e queda na produtividade. Raízes não conseguem absorver nutrientes adequadamente.' : val > 70 ? 'Excesso de umidade reduz oxigenação das raízes, favorece doenças fúngicas (podridão radicular, míldio), aumenta lixiviação de nutrientes e pode causar asfixia radicular.' : 'Umidade ideal para desenvolvimento vegetativo, absorção de nutrientes e atividade microbiana benéfica no solo.'}`,
                recomendacao: val < 40 ? 'Implementar sistema de irrigação eficiente (gotejamento ou microaspersão). Usar cobertura morta (mulching) para reter umidade. Monitorar com tensiômetros.' : val > 70 ? 'Melhorar drenagem do solo. Reduzir frequência de irrigação. Fazer sulcos de escoamento. Evitar irrigação em horários de baixa evaporação.' : 'Manter regime atual de irrigação. Monitorar com tensiômetros. Ajustar conforme estágio fenológico da cultura.',
                correcao: val < 30 ? 'URGENTE: Irrigar imediatamente. Gotejamento: 4-6 mm/dia ou Aspersão: 15-20 mm a cada 2 dias. Aplicar mulching orgânico 5-10 cm. Instalar tensiômetros a 20 e 40 cm.' : val < 40 ? 'Irrigar 2-3x por semana. Lâmina: 10-15 mm/aplicação. Mulching: palha, casca ou plástico. Monitorar tensão: irrigar quando atingir 40-50 kPa.' : val > 80 ? 'URGENTE: Suspender irrigação. Abrir sulcos de drenagem 50cm profundidade. Aplicar gesso 500 kg/ha para melhorar estrutura. Evitar tráfego no solo.' : val > 70 ? 'Reduzir irrigação em 30-40%. Melhorar drenagem superficial. Irrigar apenas em horários de maior evaporação (8h-14h).' : 'Irrigação conforme evapotranspiração da cultura (ETc). Monitorar tensão: irrigar entre 30-40 kPa.',
                produtos: ['Sistema Gotejamento Autocompensante (Netafim/Irritec) - completo', 'Tensiometro Digital (Irrometer/Watermark) - unidade', 'Mulching Organico (palha/casca) - 10-15 ton/ha', 'Manta Plastica Preta (mulching) - 25-30 micras', 'Gesso Agricola (melhoria estrutura) - 500-1.000 kg/ha', 'Controlador de Irrigacao (Galcon/Hunter) - automacao']
            },
            temp: {
                analise: `Temperatura ${val < 20 ? 'baixa' : val > 30 ? 'alta' : 'ideal'} para culturas tropicais.`,
                recomendacao: val < 20 ? 'Culturas de clima temperado' : val > 30 ? 'Cobertura morta' : 'Adequada',
                correcao: 'Fator climático. Adaptar culturas ao clima local.',
                produtos: ['Cobertura Morta', 'Sombreamento (se necessário)']
            },
            n: {
                analise: `Nitrogênio em ${Number(val).toFixed(0)} mg/kg está ${val < 100 ? 'muito baixo' : val < 150 ? 'baixo' : val > 350 ? 'excessivo' : val > 300 ? 'alto' : 'adequado'}. ${val < 150 ? 'Deficiência de N causa: clorose (amarelecimento) das folhas mais velhas, crescimento vegetativo reduzido, colmos finos e fracos, menor perfilhamento, redução drástica na produtividade (até 60%). Plantas ficam suscetíveis a pragas e doenças.' : val > 300 ? 'Excesso de N causa: crescimento vegetativo excessivo, acamamento, atraso na maturação, maior suscetibilidade a doenças, redução na qualidade dos grãos, contaminação de lençóis freáticos.' : 'Nível adequado para crescimento vigoroso, boa formação de proteínas, desenvolvimento de clorofila e máxima produtividade.'}`,
                recomendacao: val < 150 ? 'Aplicar fertilizante nitrogenado em cobertura. Parcelar aplicação em 2-3 vezes. Aplicar em dias nublados ou final da tarde. Incorporar levemente ou irrigar após aplicação.' : val > 300 ? 'Suspender adubação nitrogenada. Aumentar adubação potássica para equilibrar. Monitorar sintomas de toxidez.' : 'Manter adubação de cobertura conforme estágio fenológico. Parcelar em 2-3 aplicações.',
                correcao: val < 100 ? 'CORREÇÃO URGENTE: Ureia 45%: 200-300 kg/ha OU Sulfato Amônio 21%: 300-400 kg/ha. Aplicar 50% aos 20-30 dias e 50% aos 40-50 dias após emergência. Via foliar emergencial: Ureia 2% (2kg/100L água).' : val < 150 ? 'Ureia 45%: 150-200 kg/ha OU Sulfato Amônio 21%: 200-300 kg/ha OU Nitrato Amônio 32%: 100-150 kg/ha. Parcelar: 40% plantio + 30% V4-V6 + 30% V8-V10.' : val > 300 ? 'NÃO APLICAR N. Aplicar K2O: 80-100 kg/ha para equilibrar. Monitorar sintomas. Reduzir N em 50% na próxima safra.' : 'Manutenção: Ureia 100-150 kg/ha OU Sulfato Amônio 150-200 kg/ha. Parcelar em 2 aplicações.',
                produtos: ['Ureia 45% N (Yara/Petrobras/Heringer) - 100-300 kg/ha', 'Sulfato de Amonio 21% N + 24% S (Mosaic/Petrobras) - 150-400 kg/ha', 'Nitrato de Amonio 32% N (Yara) - 80-200 kg/ha', 'Nitrato de Calcio 15.5% N (Yara/Haifa) - foliar 2-3 kg/ha', 'Ureia Revestida (liberacao lenta) - Policote/ESN - 120-180 kg/ha', 'Ureia + Inibidor Urease (Agrotain/NBPT) - reduz perdas 30%']
            },
            p: {
                analise: `Fósforo ${val < 120 ? 'baixo, afeta raízes' : val > 250 ? 'alto' : 'adequado'}.`,
                recomendacao: val < 120 ? 'Aplicar fosfatado' : 'Manter níveis',
                correcao: val < 120 ? 'Superfosfato Simples: 300-500 kg/ha ou MAP: 150-250 kg/ha' : 'Manutenção 50-100 kg/ha',
                produtos: ['Superfosfato Simples (Mosaic) - 300-500 kg/ha', 'MAP 11-52-00 (Yara) - 150-250 kg/ha', 'Termofosfato (Yoorin) - 400-600 kg/ha']
            },
            k: {
                analise: `Potássio ${val < 150 ? 'baixo, reduz resistência' : val > 300 ? 'alto' : 'adequado'}.`,
                recomendacao: val < 150 ? 'Aplicar potássico' : 'Manter níveis',
                correcao: val < 150 ? 'Cloreto de Potássio: 100-200 kg/ha' : 'Manutenção 50-80 kg/ha',
                produtos: ['Cloreto de Potássio 60% (Mosaic) - 100-200 kg/ha', 'Sulfato de Potássio (ICL) - 80-150 kg/ha', 'Nitrato de Potássio (Yara) - 100-180 kg/ha']
            }
        };
        return dicas[tipo] || { analise: 'N/A', recomendacao: 'N/A', correcao: 'N/A', produtos: [] };
    },
    
    getProdutos(sp, n) {
        const p = [];
        if (sp.ph < 6) p.push(['Calcário Dolomítico', 'Yara/Mosaic', 'Correção pH', '2-4 ton/ha']);
        if (n.nitrogenio < 150) {
            p.push(['Ureia 45%', 'Yara/Petrobras', 'Adubação N', '100-200 kg/ha']);
            p.push(['Sulfato Amônio', 'Mosaic/Heringer', 'N+S', '150-250 kg/ha']);
        }
        if (n.fosforo < 120) {
            p.push(['Superfosfato Simples', 'Mosaic/Yara', 'Adubação P', '300-500 kg/ha']);
            p.push(['MAP 11-52-00', 'Mosaic/Yara', 'P+N', '150-250 kg/ha']);
        }
        if (n.potassio < 150) p.push(['Cloreto Potássio', 'Mosaic/ICL', 'Adubação K', '100-200 kg/ha']);
        p.push(['NPK 04-14-08', 'Yara/Heringer', 'Plantio', '300-400 kg/ha']);
        p.push(['NPK 20-05-20', 'Yara/Mosaic', 'Cobertura', '150-200 kg/ha']);
        return p;
    },
    
    getUnidade(tipo) {
        return { ph: '', umidade: '%', temp: '°C', n: ' mg/kg', p: ' mg/kg', k: ' mg/kg' }[tipo] || '';
    },
    
    getSt(v, min, max) {
        if (!v) return 'N/A';
        return v >= min && v <= max ? '✓ Ideal' : v < min * 0.8 || v > max * 1.2 ? '❌ Crítico' : '⚠ Atenção';
    }
};

window.PDFExporter = PDFExporter;
