# Discord Bot on Render (Free, 24/7)

This repository contains a complete setup to run your Discord bot 24/7 on Render's free tier using Docker, with optional SSH access via ngrok.

## Features
- Runs your Discord bot (Node.js) in a Docker container.
- Stays awake forever using cron-job.org pings.
- Optional SSH access via ngrok tunnel.
- Health endpoint for keep-alive.
- Easy local testing with Docker Compose.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed locally.
- A Discord bot token from the [Discord Developer Portal](https://discord.com/developers/applications).

### Local Testing
1. Clone this repository.
2. Copy `.env.example` to `.env` and fill in your `TOKEN`.
3. Build the image:
   ```bash
   ./build_image.sh
