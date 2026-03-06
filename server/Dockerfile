FROM node:22-alpine AS builder
WORKDIR /workspace
COPY tsconfig.base.json ./tsconfig.base.json
WORKDIR /workspace/server
COPY server/package.json server/tsconfig.json ./
COPY server/src ./src
RUN npm install -g pnpm && pnpm install && pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /workspace/server/dist ./dist
COPY --from=builder /workspace/server/node_modules ./node_modules
COPY --from=builder /workspace/server/package.json ./
EXPOSE 4039
CMD ["node", "dist/index.js"]
