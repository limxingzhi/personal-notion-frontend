FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

ARG NEXT_PUBLIC_KANBAN_LABEL
ARG NEXT_PUBLIC_KANBAN_URL
ARG NEXT_PUBLIC_ADD_LABEL
ARG NEXT_PUBLIC_ADD_URL

COPY . .
RUN NEXT_OUTPUT=standalone npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nodejs /app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

USER nextjs

CMD ["node", "server.js"]
