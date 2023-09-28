FROM node:18-alpine AS build

ARG NODE_ENV

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build 

FROM build as test

RUN chmod a+x ./scripts/run_tests.sh

ENTRYPOINT [ "./scripts/run_tests.sh" ]

FROM build AS run

EXPOSE 3000

CMD ["npm", "run", "start:prod"]