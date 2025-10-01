# syntax=docker/dockerfile:1.7-labs
FROM node:20-alpine AS base
WORKDIR /srv

FROM base AS dev
RUN corepack enable
COPY . .
RUN pnpm install
CMD ["pnpm","--filter","@hr/worker","dev"]
