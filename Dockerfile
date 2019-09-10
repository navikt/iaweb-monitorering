FROM navikt/node-express:1.0.0
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm i --frozen-lockfile
COPY src/server/ src/server/

EXPOSE 8080
ENTRYPOINT ["node", "src/server/server.js"]