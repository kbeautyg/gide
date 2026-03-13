FROM node:20-bookworm

# Устанавливаем зависимости
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tini \
    curl \
    unzip \
    ca-certificates \
    libmagic1 \
    ffmpeg \
    libssl-dev \
    zlib1g-dev \
    libpq-dev \
    build-essential \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Установка n8n
ENV N8N_VERSION=2.1.4
RUN npm install -g n8n@${N8N_VERSION} && npm cache clean --force

# Рабочая директория для установки Telepilot
USER node
WORKDIR /home/node/telepilot-nodes

# Инициализация npm и установка Telepilot
RUN npm init -y
RUN npm install @telepilotco/n8n-nodes-telepilot

# Копируем node_modules в .n8n/nodes
RUN mkdir -p /home/node/.n8n/nodes && \
    cp -R node_modules /home/node/.n8n/nodes/

# Скачиваем TDLib бинарник вручную
# (Исправлено: предполагается, что папка должна называться prebuilt или аналогично)
RUN mkdir -p /home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilt










