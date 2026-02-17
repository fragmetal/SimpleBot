#!/bin/bash
set -e

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting services..."

# Start nginx (if enabled)
if [ -f /usr/sbin/nginx ]; then
    log "Starting nginx..."
    nginx -g 'daemon off;' &
    NGINX_PID=$!
    log "nginx started with PID $NGINX_PID"
fi

# Start SSH daemon (if enabled)
if [ -f /usr/sbin/sshd ] && [ "${SSH_ENABLED}" = "true" ]; then
    log "Starting SSH daemon..."
    /usr/sbin/sshd -D &
    SSHD_PID=$!
    log "SSH daemon started with PID $SSHD_PID"
fi

# Start ngrok tunnel for SSH (optional)
if [ "${NGROK_ENABLED}" = "true" ] && [ -n "${NGROK_AUTHTOKEN}" ]; then
    log "Starting ngrok tunnel for SSH..."
    ngrok authtoken ${NGROK_AUTHTOKEN}
    ngrok tcp 22 --log=stdout > /dev/null &
    NGROK_PID=$!
    log "ngrok started with PID $NGROK_PID"
    # Give ngrok a moment to establish tunnel
    sleep 5
    # Fetch and log the public URL
    curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print('ngrok tunnel URL:', json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null || true
fi

# Start Discord bot
log "Starting Discord bot..."
cd /app
node index.js &
BOT_PID=$!
log "Bot started with PID $BOT_PID"

# Wait for any process to exit
wait -n

# Exit with status of first process that exits
exit $?
