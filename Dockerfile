FROM node:22 AS builder

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:22-slim

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --prod --frozen-lockfile \
    && chown -R node:node /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

USER node

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE $PORT

CMD [ "node", "dist/index.js" ]
