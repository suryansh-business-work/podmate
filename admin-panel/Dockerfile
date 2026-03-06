FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_API_URL=https://podify-api.exyconn.com/graphql
ENV VITE_API_URL=$VITE_API_URL
COPY package.json tsconfig.json index.html vite.config.ts ./
COPY src ./src
RUN npm install -g pnpm && pnpm install --frozen-lockfile && pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4040
CMD ["nginx", "-g", "daemon off;"]
