FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ── Stage 2: Build ─────────────────────────────────────────
FROM deps AS build
COPY . .

ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_PAYSTACK_PUBLIC_KEY

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_PAYSTACK_PUBLIC_KEY=${VITE_PAYSTACK_PUBLIC_KEY}

RUN npm run build

# ── Stage 3: Runner ────────────────────────────────────────
FROM node:22-alpine AS runner
RUN npm install -g serve@14
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist

EXPOSE 3000
USER node

CMD ["serve", "-s", "dist", "-l", "3000"]
