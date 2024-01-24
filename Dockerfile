FROM node:20.9.0-alpine AS base

WORKDIR /app

COPY . .
COPY [ "package.json", "package-lock.json" ]
RUN npm install prisma --save-dev

FROM base AS prod
EXPOSE 3000
ENV NODE_ENV=production
COPY --from=base /app ./
RUN npm install -g @nestjs/cli
CMD npx prisma migrate deploy && npm run start

