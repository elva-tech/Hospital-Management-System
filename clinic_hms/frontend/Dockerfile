FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Use Host binding for Vite in Docker
ENV HOST=0.0.0.0

EXPOSE 5173

CMD ["npm", "run", "dev"]
