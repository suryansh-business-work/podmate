FROM node:22-alpine AS builder
WORKDIR /workspace
COPY tsconfig.base.json ./tsconfig.base.json
WORKDIR /workspace/admin-panel
ARG VITE_API_URL=https://podify-api.exyconn.com/graphql
ENV VITE_API_URL=$VITE_API_URL
COPY admin-panel/package.json admin-panel/tsconfig.json admin-panel/index.html admin-panel/vite.config.ts ./
COPY admin-panel/src ./src
RUN npm install -g pnpm && pnpm install && pnpm build

FROM nginx:alpine
COPY --from=builder /workspace/admin-panel/dist /usr/share/nginx/html
COPY admin-panel/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4040
CMD ["nginx", "-g", "daemon off;"]
