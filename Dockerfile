FROM navikt/node-express:14
WORKDIR /var/server

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY src/ src/

EXPOSE 8080
ENTRYPOINT ["node", "src/server.js"]