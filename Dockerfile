FROM node:18-alpine

# Install nginx (optional, for health endpoint routing)
RUN apk add --no-cache nginx

WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm ci --only=production

# Copy bot source
COPY . .

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY start_services.sh /start_services.sh
RUN chmod +x /start_services.sh

# Expose the port Render expects
EXPOSE 10000

# Start services
CMD ["/start_services.sh"]
