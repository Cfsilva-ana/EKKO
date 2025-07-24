# 🌱 Projeto Ekko – Robô Autônomo para Análise de Solo

> Este repositório foi desenvolvido para apresentar o funcionamento completo do Projeto Ekko a uma banca avaliativa escolar. Ele reúne **todo o sistema**: robô, backend, frontend e banco de dados – em um único lugar, mostrando a integração entre hardware e software para coleta e visualização de dados ambientais.

---

## 📘 Visão Geral

O Ekko é um robô seguidor de linha com sensores que coleta dados do solo, como umidade e temperatura. Esses dados são enviados para uma **API (backend)**, armazenados em um **banco de dados MongoDB** e visualizados por uma **interface web intuitiva**.

---

## 📌 Objetivo

O projeto foi criado para:

- Automatizar a coleta de dados do solo
- Facilitar a visualização e análise dos dados em tempo real
- Aplicar conceitos de robótica, programação web e banco de dados de forma integrada

---

## 🤖 Módulo Robô (ESP32)

- Usa sensores de linha para navegação
- Mede dados ambientais com sensores (como umidade e temperatura do solo)
- Envia os dados via Wi-Fi (HTTP ou MQTT)
- Código em C++ (Arduino IDE ou PlatformIO)

---

## 🧠 Backend (API REST com Node.js)

- Recebe os dados enviados pelo robô
- Valida e armazena os dados no banco de dados
- Disponibiliza rotas para consulta e visualização
- Pode ser testado com ferramentas como Postman

---

## 🗄 Banco de Dados (MongoDB)

- Utiliza o MongoDB para armazenar dados não estruturados
- Modelos principais:
  - `SensorData`: tipo do sensor, valor, data e localização
  - `Device`: identificação do robô
  - `User`: para autenticação da interface (futuramente)

---

## 🖥 Interface Web

- Consulta e exibição dos dados em tempo real
- Visualização por gráfico, lista ou filtros
- Desenvolvida para ser acessível e responsiva
- Conectada diretamente à API

---

## 🧪 Como Testar

### Pré-requisitos:
- Node.js
- MongoDB local ou Atlas
- Placa ESP32
- Navegador moderno

### Etapas:

```bash
# 1. Backend
cd backend
npm install
npm run dev

# 2. Frontend
cd ../frontend
npm install
npm start
