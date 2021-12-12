FROM node:16

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY src ./

RUN yarn install
RUN yarn build

CMD yarn start

EXPOSE 80