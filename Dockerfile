FROM navikt/node-express:12.2.0-alpine
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY src/ src/

EXPOSE 8080
ENTRYPOINT ["node", "src/server.js"]