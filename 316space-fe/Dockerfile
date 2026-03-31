# syntax=docker/dockerfile:1
# 런타임: vite preview → :3000 (로컬 개발과 동일 포트)
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

# Next의 NEXT_PUBLIC_* 와 같이, 빌드 시 브라우저에 박을 절대 API 베이스가 필요하면 전달 (미사용이면 비워둠)
ARG VITE_PUBLIC_API_URL=
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL

RUN pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable && apk add --no-cache wget
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY vite.config.ts ./
COPY public ./public
COPY --from=build /app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production
# compose에서 덮어쓸 수 있음; FE만 :3000으로 직접 붙을 때 /api 프록시 대상
ENV VITE_API_PROXY_TARGET=http://be:8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["pnpm", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "3000", "--strictPort"]
