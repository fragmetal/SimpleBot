#!/bin/bash
set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting services..."

# Start SSH daemon (for native SSH access, optional)
if [ -f /usr/sbin/sshd ]; then
    log "Starting SSH daemon..."
    /usr/sbin/sshd -D &
    SSHD_PID=$!
    log "SSH daemon started with PID $SSHD_PID"
fi

# Start the web server (with SSH terminal)
log "Starting web server..."
cd /app
node web.js &
WEB_PID=$!
log "Web server started with PID $WEB_PID"

log "All services started. Bot is not running. Use SSH to start it manually."

# Wait for any process to exit
wait -n
exit $?
