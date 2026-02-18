FROM alpine:latest

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    curl \
    openssh \
    nodejs \
    npm \
    screen \
    nano

# Install cloudflared
RUN curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 && \
    chmod +x cloudflared && \
    mv cloudflared /usr/local/bin/

# Configure SSH
RUN ssh-keygen -A && \
    echo 'root:SecurePass123' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Build argument for GitHub token (pass it with --build-arg GITHUB_TOKEN=xxx)
ARG GITHUB_TOKEN
# Clone the repository using the token (if provided)
RUN if [ -n "$GITHUB_TOKEN" ]; then \
        git clone https://onerelay:${GITHUB_TOKEN}@github.com/onerelay/Relay.git /tmp/Relay && \
        mv /tmp/Relay/* /bot/ && \
        mv /tmp/Relay/.* /bot/ 2>/dev/null || true && \
        rm -rf /tmp/Relay; \
    fi

# Create working directories (if not already existing)
RUN mkdir -p /app /bot

# Copy package.json from root and install dependencies
COPY package*.json ./
RUN npm install

# Copy local app and bot folders (if any, but if you cloned above, this may be optional)
COPY app/ /app
# If you didn't clone, you might still copy a local bot folder:
# COPY bot/ /bot

# Copy startup script
COPY start_services.sh /start_services.sh
RUN chmod +x /start_services.sh

# Expose ports
EXPOSE 10000 22

CMD ["/start_services.sh"]
