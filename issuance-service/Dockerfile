# stage-1
FROM node:20.19.5-alpine3.22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# stage-2
FROM node:20.19.5-alpine3.22
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD [ "node", "dist/index.js" ]