FROM node:24-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend/ ./
COPY lambda/ /lambda/

EXPOSE 3000

CMD ["npm", "start"]