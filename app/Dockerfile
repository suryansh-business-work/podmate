FROM node:22-alpine AS builder
WORKDIR /workspace
COPY tsconfig.base.json ./tsconfig.base.json
WORKDIR /workspace/app
COPY app/package.json app/tsconfig.json app/app.json app/babel.config.js app/metro.config.js ./
COPY app/assets ./assets
COPY app/plugins ./plugins
COPY app/App.tsx ./
COPY app/src ./src
RUN npm install -g pnpm && pnpm install
ENV NODE_ENV=production
ENV EXPO_PUBLIC_API_URL=https://podify-api.exyconn.com/graphql
RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=builder /workspace/app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4038
CMD ["nginx", "-g", "daemon off;"]
