FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
COPY functions/package*.json functions/

# Install root dependencies
RUN npm ci

# Install function dependencies
WORKDIR /app/functions
RUN npm ci

WORKDIR /app

# Copy source code
COPY . .

# Build the Next.js app
ENV NODE_ENV production
RUN npm run build

# Build Firebase functions
RUN npm run build --prefix functions

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start Next.js server
CMD ["npm", "start"]
