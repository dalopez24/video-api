# Stage 1 - the build process
FROM node:20.14.0-buster-slim as build-deps
WORKDIR /usr/src/app


RUN npm install -g pnpm


COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2 - the production environment
FROM node:20.14.0-buster-slim
WORKDIR /usr/src/app

RUN npm install -g pnpm

RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends

COPY --from=build-deps /usr/src/app/dist ./dist
COPY package.json pnpm-lock.yaml ./

RUN apt-get install -y ffmpeg



EXPOSE 3000

CMD ["node", "dist/main"]