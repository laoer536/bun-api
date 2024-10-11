FROM oven/bun AS build
WORKDIR /app
# Cache packages installation
COPY . .
RUN bun install

ENV NODE_ENV=production
RUN bun run prisma:generate
RUN bun run build

FROM gcr.io/distroless/base AS backend
WORKDIR /app
COPY --from=build /app/packages/backend/server server

ENV NODE_ENV=production

CMD ["./server"]

FROM nginx:alpine AS frontend
WORKDIR /app
COPY ./packages/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 5173