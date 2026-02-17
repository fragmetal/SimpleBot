#!/bin/bash
set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting services..."

# Start SSH daemon (optional)
if [ -f /usr/sbin/sshd ]; then
    log "Starting SSH daemon..."
    /usr/sbin/sshd -D &
    SSHD_PID=$!
    log "SSH daemon started with PID $SSHD_PID"
fi

# Start cloudflared tunnel (if token provided)
if [ -n "$CLOUDFLARED_TOKEN" ]; then
    log "Starting cloudflared tunnel..."
    cloudflared tunnel --no-autoupdate run --token "$CLOUDFLARED_TOKEN" &
    CLOUDFLARED_PID=$!
    log "cloudflared started with PID $CLOUDFLARED_PID"
fi

# Start Discord bot (listens on Render's PORT env var)
log "Starting Discord bot..."
cd /app
node index.js &
BOT_PID=$!
log "Bot started with PID $BOT_PID"

# Wait for any process to exit
wait -n

# Exit with status of first process that exits
exit $?
