# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/plugin-sdk/package.json packages/plugin-sdk/package.json
COPY packages/plugin-github/package.json packages/plugin-github/package.json
RUN pnpm install

FROM deps AS builder
COPY . .
RUN pnpm --filter @builderos/db run generate
RUN pnpm --filter web run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /repo /repo
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @builderos/db run migrate:deploy && pnpm --filter web run start"]
