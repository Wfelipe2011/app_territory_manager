FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-slim

WORKDIR /app

COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/public ./public

ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "start"]
