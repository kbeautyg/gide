FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ARG VITE_CDN_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CDN_URL=$VITE_CDN_URL
RUN npm run build

FROM nginx:alpine
# Устанавливаем bash (для удобства отладки) и envsubst (обычно есть в nginx:alpine, но проверим)
RUN apk add --no-cache bash

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Делаем скрипт исполняемым
RUN chmod +x /docker-entrypoint.sh

# Запускаем через скрипт
ENTRYPOINT ["/docker-entrypoint.sh"]
