// Motor de Correlações Automáticas
const CorrelationEngine = {
    
    // Calcular correlação de Pearson entre dois arrays
    calculateCorrelation(x, y) {
        if (x.length !== y.length || x.length === 0) return 0;
        
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    },
    
    // Analisar correlações entre todos os parâmetros
    analyzeCorrelations(data) {
        const parameters = ['ph', 'umidade', 'temp', 'salinidade', 'condutividade', 'n', 'p', 'k'];
        const correlations = [];
        
        for (let i = 0; i < parameters.length; i++) {
            for (let j = i + 1; j < parameters.length; j++) {
                const param1 = parameters[i];
                const param2 = parameters[j];
                
                const values1 = data.map(d => d[param1]).filter(v => v !== undefined);
                const values2 = data.map(d => d[param2]).filter(v => v !== undefined);
                
                if (values1.length > 2 && values2.length > 2) {
                    const correlation = this.calculateCorrelation(values1, values2);
                    
                    if (Math.abs(correlation) > 0.3) { // Apenas correlações significativas
                        correlations.push({
                            param1,
                            param2,
                            correlation: Math.round(correlation * 100) / 100,
                            strength: this.getCorrelationStrength(correlation),
                            direction: correlation > 0 ? 'positive' : 'negative',
                            insight: this.generateInsight(param1, param2, correlation)
                        });
                    }
                }
            }
        }
        
        return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    },
    
    // Classificar força da correlação
    getCorrelationStrength(r) {
        const abs = Math.abs(r);
        if (abs >= 0.8) return 'muito_forte';
        if (abs >= 0.6) return 'forte';
        if (abs >= 0.4) return 'moderada';
        return 'fraca';
    },
    
    // Gerar insight em linguagem natural
    generateInsight(param1, param2, correlation) {
        const names = {
            ph: 'pH',
            umidade: 'umidade',
            temp: 'temperatura',
            salinidade: 'salinidade',
            condutividade: 'condutividade',
            n: 'nitrogênio',
            p: 'fósforo',
            k: 'potássio'
        };
        
        const name1 = names[param1] || param1;
        const name2 = names[param2] || param2;
        
        if (correlation > 0) {
            return `Quando ${name1} aumenta, ${name2} tende a aumentar também`;
        } else {
            return `Quando ${name1} aumenta, ${name2} tende a diminuir`;
        }
    },
    
    // Renderizar cards de correlação
    renderCorrelationCards(correlations) {
        if (!correlations || correlations.length === 0) {
            return '<div class="no-correlations">Nenhuma correlação significativa encontrada</div>';
        }
        
        return correlations.slice(0, 4).map(corr => `
            <div class="correlation-card ${corr.strength}">
                <div class="correlation-header">
                    <div class="correlation-params">
                        <span class="param">${this.getParamIcon(corr.param1)} ${this.getParamName(corr.param1)}</span>
                        <i class="fas fa-${corr.direction === 'positive' ? 'arrow-up' : 'arrow-down'} correlation-arrow ${corr.direction}"></i>
                        <span class="param">${this.getParamIcon(corr.param2)} ${this.getParamName(corr.param2)}</span>
                    </div>
                    <div class="correlation-value ${corr.direction}">
                        ${corr.correlation > 0 ? '+' : ''}${corr.correlation}
                    </div>
                </div>
                <div class="correlation-strength">
                    <span class="strength-badge ${corr.strength}">
                        ${this.getStrengthText(corr.strength)} ${corr.direction === 'positive' ? 'Positiva' : 'Negativa'}
                    </span>
                </div>
                <div class="correlation-insight">
                    "${corr.insight}"
                </div>
            </div>
        `).join('');
    },
    
    // Ícones dos parâmetros
    getParamIcon(param) {
        const icons = {
            ph: '🧪',
            umidade: '💧',
            temp: '🌡️',
            salinidade: '🧂',
            condutividade: '⚡',
            n: '🍃',
            p: '🌱',
            k: '🌿'
        };
        return icons[param] || '📊';
    },
    
    // Nomes dos parâmetros
    getParamName(param) {
        const names = {
            ph: 'pH',
            umidade: 'Umidade',
            temp: 'Temperatura',
            salinidade: 'Salinidade',
            condutividade: 'Condutividade',
            n: 'Nitrogênio',
            p: 'Fósforo',
            k: 'Potássio'
        };
        return names[param] || param.toUpperCase();
    },
    
    // Texto da força
    getStrengthText(strength) {
        const texts = {
            muito_forte: 'Muito Forte',
            forte: 'Forte',
            moderada: 'Moderada',
            fraca: 'Fraca'
        };
        return texts[strength] || 'Desconhecida';
    }
};

window.CorrelationEngine = CorrelationEngine;