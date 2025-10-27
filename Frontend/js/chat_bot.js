

document.addEventListener('DOMContentLoaded', () => {

    const chatSection = document.getElementById('chatbot-section');
    if (!chatSection) {
        console.log("Módulo do Chatbot Ekko não ativo nesta página.");
        return;
    }
    // --- CONFIGURAÇÃO ---
    const unityId = localStorage.getItem("unityId") || "default_user";
    
    console.log("=== Módulo do Chatbot Ekko ===");
    console.log("Unity ID:", unityId);
    console.log("Chave de sessões:", `ekkoChatSessions_${unityId}`);
    console.log("================================");

    // --- ELEMENTOS DA INTERFACE (DOM) ---
    const chatWrapper = document.getElementById('ekko-chat-wrapper');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const historyList = document.getElementById('history-list');
    const newSessionBtn = document.getElementById('new-session-btn');
    const chatBox = document.getElementById('ekko-chat-box');
    const userInput = document.getElementById('ekko-user-input');
    const sendBtn = document.getElementById('ekko-send-btn');
    const locationBtn = document.getElementById('ekko-location-btn');
    
    // Elementos do Modal de Confirmação
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    
    if (!unityId || unityId === "null" || unityId === "undefined") {
        console.error("Unity ID inválido!");
        alert("Erro: Unity ID não encontrado. Faça login novamente.");
        return;
    }
    
    const API_URL_CHAT = `http://${window.location.hostname}:8002/api/chat/${unityId}`;
    const API_URL_TITLE = `http://${window.location.hostname}:8002/api/generate_title`;

    // --- ESTADO DA APLICAÇÃO ---
    let userCoordinates = null;
    let isLoading = false;
    let sessions = {};
    let activeSessionId = null;

    // --- LÓGICA DA SIDEBAR RETRÁTIL ---
    function setupSidebarToggle() {
        if (!toggleSidebarBtn || !chatWrapper) return;
        
        const sidebarKey = `ekkoSidebarCollapsed_${unityId}`;
        
        if (localStorage.getItem(sidebarKey) === 'true') {
            chatWrapper.classList.add('sidebar-collapsed');
        }

        toggleSidebarBtn.addEventListener('click', () => {
            chatWrapper.classList.toggle('sidebar-collapsed');
            localStorage.setItem(sidebarKey, chatWrapper.classList.contains('sidebar-collapsed'));
        });
    }

    // --- LÓGICA DE GESTÃO DE SESSÕES ---

    function loadSessions() {
        try {
            const storageKey = `ekkoChatSessions_${unityId}`;
            const activeKey = `ekkoActiveSessionId_${unityId}`;
            
            console.log("Carregando sessões com chave:", storageKey);
            
            const storedSessions = localStorage.getItem(storageKey);
            sessions = storedSessions ? JSON.parse(storedSessions) : {};
            activeSessionId = localStorage.getItem(activeKey);
            
            console.log("Sessões carregadas:", Object.keys(sessions).length);

            if (Object.keys(sessions).length === 0 || !sessions[activeSessionId]) {
                console.log("Criando nova sessão...");
                createNewSession();
            } else {
                renderHistorySidebar();
                loadSession(activeSessionId);
            }
        } catch (error) {
            console.error("Erro ao carregar sessões:", error);
            createNewSession();
        }
    }

    function saveSessions() {
        try {
            const storageKey = `ekkoChatSessions_${unityId}`;
            const activeKey = `ekkoActiveSessionId_${unityId}`;
            
            localStorage.setItem(storageKey, JSON.stringify(sessions));
            localStorage.setItem(activeKey, activeSessionId);
            
            console.log("Sessões salvas:", storageKey);
        } catch (error) {
            console.error("Erro ao salvar sessões:", error);
        }
    }

    function renderHistorySidebar() {
        historyList.innerHTML = '';
        const sortedSessionIds = Object.keys(sessions).sort((a, b) => b.localeCompare(a));

        sortedSessionIds.forEach(sessionId => {
            const session = sessions[sessionId];
            const item = document.createElement('li');
            item.className = 'history-item';
            item.textContent = session.title;
            item.dataset.sessionId = sessionId;
            if (sessionId === activeSessionId) {
                item.classList.add('active');
            }
            
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-session-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = "Apagar conversa";
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteSession(sessionId);
            };
            item.appendChild(deleteBtn);

            item.addEventListener('click', () => {
                if(activeSessionId !== sessionId) loadSession(sessionId);
            });
            historyList.appendChild(item);
        });
    }

    function loadSession(sessionId) {
        if (!sessions[sessionId]) return;
        activeSessionId = sessionId;
        chatBox.innerHTML = sessions[sessionId].history;
        renderHistorySidebar();
        saveSessions();
        smoothScrollToBottom();
    }

    function createNewSession() {
        const newSessionId = `session_${new Date().getTime()}`;
        const sessionNumber = Object.keys(sessions).length + 1;
        sessions[newSessionId] = {
            title: `Nova Conversa ${sessionNumber}`,
            history: ''
        };
        loadSession(newSessionId);
    }

    function deleteSession(sessionIdToDelete) {
        if (Object.keys(sessions).length <= 1) {
            alert("Não é possível apagar a única conversa existente.");
            return;
        }
        
        const sessionTitle = sessions[sessionIdToDelete].title;
        
        confirmModalText.textContent = `Tem a certeza de que quer apagar a conversa "${sessionTitle}"? Esta ação não pode ser desfeita.`;
        confirmModal.classList.add('active');

        function closeModal() {
            confirmModal.classList.remove('active');
            confirmDeleteBtn.onclick = null;
            cancelDeleteBtn.onclick = null;
            confirmModal.onclick = null;
        }

        const handleConfirm = () => {
            console.log(`Sessão "${sessionTitle}" apagada.`);
            delete sessions[sessionIdToDelete];

            if (activeSessionId === sessionIdToDelete) {
                activeSessionId = Object.keys(sessions).sort((a, b) => b.localeCompare(a))[0];
            }
            
            // Se, após apagar, não sobrar nenhuma sessão, cria uma nova
            if (!activeSessionId) {
                createNewSession();
            } else {
                loadSession(activeSessionId);
            }
            
            closeModal();
        };

        const handleCancel = () => {
            console.log("Exclusão da sessão cancelada.");
            closeModal();
        };

        confirmDeleteBtn.onclick = handleConfirm;
        cancelDeleteBtn.onclick = handleCancel;
        confirmModal.onclick = (event) => {
            if (event.target === confirmModal) {
                handleCancel();
            }
        };
    }
    
    // --- LÓGICA DO CHAT (FUNÇÕES DE UI E COMUNICAÇÃO) ---
    
    function smoothScrollToBottom() {
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    }

    function removeStatusMessage() {
        const statusElement = document.getElementById('status-message');
        if (statusElement) statusElement.remove();
    }

    function showStatusMessage(message) {
        removeStatusMessage();
        const statusElement = document.createElement('div');
        statusElement.id = 'status-message';
        statusElement.className = 'message status-message';
        statusElement.textContent = `⚙️ ${message}`;
        chatBox.appendChild(statusElement);
        smoothScrollToBottom();
    }
    
    function addUserMessage(message) {
        console.log('Adicionando mensagem do usuário:', message);
        const userMsgHtml = `<div class="message user-message">${message}</div>`;
        sessions[activeSessionId].history += userMsgHtml;
        chatBox.innerHTML = sessions[activeSessionId].history;
        console.log('HTML do chat atualizado');
        smoothScrollToBottom();
    }
    
    function createBotMessageElement() {
        const placeholderId = `bot-msg-${new Date().getTime()}`;
        const botMsgHtml = `<div class="message bot-message" id="${placeholderId}"></div>`;
        sessions[activeSessionId].history += botMsgHtml;
        chatBox.innerHTML = sessions[activeSessionId].history;
        smoothScrollToBottom();
        return document.getElementById(placeholderId);
    }

    function updateBotMessage(element, newTextChunk) {
        if(!element) return;
        const fullText = (element.dataset.fullText || '') + newTextChunk;
        element.dataset.fullText = fullText;
        
        // Renderizar markdown se marked estiver disponível
        if (typeof marked !== 'undefined') {
            element.innerHTML = marked.parse(fullText);
        } else {
            element.textContent = fullText;
        }
        
        sessions[activeSessionId].history = chatBox.innerHTML;
        smoothScrollToBottom();
    }
    
    function addBotInfoMessage(message) {
        const botMsgHtml = `<div class="message bot-message">${message}</div>`;
        sessions[activeSessionId].history += botMsgHtml;
        chatBox.innerHTML = sessions[activeSessionId].history;
        saveSessions();
        smoothScrollToBottom();
    }

    async function sendMessage() {
        const question = userInput.value.trim();
        console.log('sendMessage chamado, pergunta:', question);
        if (question === '' || isLoading) {
            console.log('Mensagem vazia ou já carregando');
            return;
        }

        isLoading = true;
        console.log('Adicionando mensagem do usuário...');
        addUserMessage(question);
        userInput.value = '';
        userInput.focus();
        showStatusMessage("A processar...");
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sessions[activeSessionId].history;
        const chatHistoryText = Array.from(tempDiv.querySelectorAll('.message')).map(m => m.innerText).slice(-8);

        try {
            const response = await fetch(API_URL_CHAT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question, history: chatHistoryText, coordinates: userCoordinates }),
            });
            
            removeStatusMessage();
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botMessageElement = createBotMessageElement();

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    if (botMessageElement) botMessageElement.removeAttribute('id');
                    saveSessions();
                    generateSessionTitle(activeSessionId);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = JSON.parse(line.substring(6));
                            if (jsonData.type === 'status') {
                                showStatusMessage(jsonData.message);
                            } else if (jsonData.type === 'chunk') {
                                removeStatusMessage();
                                updateBotMessage(botMessageElement, jsonData.message);
                            }
                        } catch (e) { /* Ignora erros de parsing */ }
                    }
                }
            }
        } catch (error) {
            removeStatusMessage();
            addBotInfoMessage("Ops! Tive um problema de comunicação com o servidor.");
            console.error('Erro ao enviar mensagem:', error);
        } finally {
            isLoading = false;
        }
    }

    async function generateSessionTitle(sessionId) {
        const session = sessions[sessionId];
        const messageCount = (session.history.match(/class="message/g) || []).length;
        
        if (!session.title.startsWith('Nova Conversa') || messageCount < 4) return;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = session.history;
        const historyText = tempDiv.innerText;

        try {
            const response = await fetch(API_URL_TITLE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: historyText })
            });
            const data = await response.json();
            if (data.title) {
                let title = data.title.substring(0, 20);
                if (data.title.length > 20) title += '...';
                sessions[sessionId].title = title;
                saveSessions();
                renderHistorySidebar();
            }
        } catch (error) {
            console.error("Erro ao gerar título:", error);
        }
    }

    function getLocation() {
        if (isLoading) return;
        if (navigator.geolocation) {
            showStatusMessage("A obter coordenadas...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    removeStatusMessage();
                    userCoordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    addBotInfoMessage("Localização ativada! Posso agora fornecer previsões do tempo precisas.");
                    locationBtn.querySelector('svg').style.fill = '#27ae60';
                },
                (error) => {
                    removeStatusMessage();
                    addBotInfoMessage("Não foi possível obter a sua localização. Verifique as permissões do navegador.");
                    console.error("Erro de Geolocalização:", error.message);
                }
            );
        } else {
             addBotInfoMessage("Geolocalização não é suportada por este navegador.");
        }
    }

    // --- INICIALIZAÇÃO E EVENT LISTENERS ---
    
    newSessionBtn.addEventListener('click', createNewSession);
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
    if (locationBtn) locationBtn.addEventListener('click', getLocation);
    
    setupSidebarToggle();
    loadSessions();
});