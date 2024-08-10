## 환경 설정

```
pnpm i

docker compose -f ./docker-compose.dev.yaml up -d

pnpm run prisma-db-push

pnpm add -g concurrently

pnpm run dev
```
