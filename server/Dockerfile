FROM node:18.12.1-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++ \
    bash

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

RUN npm rebuild bcrypt --build-from-source

COPY . .

ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin

EXPOSE 5000

CMD [ "npm", "start" ]