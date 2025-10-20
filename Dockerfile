FROM node:18-alpine

WORKDIR /app
COPY package*.json turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci --only=production && npm ci --only=dev --no-cache

EXPOSE 3000 3001 3002 4000
CMD ["npm", "run", "dev"]