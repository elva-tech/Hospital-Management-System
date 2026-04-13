FROM node:20-alpine
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libc6-compat \
    openssl

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy everything
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
