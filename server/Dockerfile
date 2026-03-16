FROM node:22-alpine AS builder
WORKDIR /workspace
COPY tsconfig.base.json ./tsconfig.base.json
WORKDIR /workspace/server
COPY server/package.json server/tsconfig.json ./
RUN npm install -g pnpm && pnpm install --shamefully-hoist
COPY server/src ./src
RUN pnpm build
RUN pnpm prune --prod

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /workspace/server/dist ./dist
COPY --from=builder /workspace/server/node_modules ./node_modules
COPY --from=builder /workspace/server/package.json ./
COPY --from=builder /workspace/server/tsconfig.json ./
COPY --from=builder /workspace/tsconfig.base.json ../tsconfig.base.json
EXPOSE 4039
CMD ["node", "--import", "tsx", "dist/index.js"]
