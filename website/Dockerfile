FROM node:22-alpine AS builder
WORKDIR /workspace/website
COPY website/package.json website/tsconfig.json website/astro.config.mjs ./
COPY website/src ./src
RUN npm install -g pnpm && pnpm install && pnpm build

FROM nginx:alpine
COPY --from=builder /workspace/website/dist /usr/share/nginx/html
COPY website/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4041
CMD ["nginx", "-g", "daemon off;"]
