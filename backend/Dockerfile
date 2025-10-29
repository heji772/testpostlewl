FROM node:18-alpine
WORKDIR /app

# Instaliraj wget za health check
RUN apk add --no-cache wget

COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]