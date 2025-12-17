FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
RUN yarn global add serve
EXPOSE 8000
CMD ["serve", "-s", "dist", "-l", "8000"]