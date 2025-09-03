# Debian-based image so we can apt-get swi-prolog
FROM node:22-slim

# Install SWI-Prolog (required for your Prolog engine)
RUN apt-get update \
 && apt-get install -y --no-install-recommends swi-prolog \
 && rm -rf /var/lib/apt/lists/*

# App dir
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Make sure your server binds to process.env.PORT (we'll set it when deploying)
ENV NODE_ENV=production
# EXPOSE is optional for docs
EXPOSE 5000

# Start app
CMD ["node", "server.js"]
