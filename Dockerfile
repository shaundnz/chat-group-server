FROM node:16 AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

FROM base AS build

RUN npm run build 

RUN npm run test

RUN npm run test:e2e

FROM build AS run

CMD ["npm", "run", "start:dev"]