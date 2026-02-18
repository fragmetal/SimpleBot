const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 10000;

// Setup SSH WebSocket
const setupSSHWebSocket = require('./ssh-server');
setupSSHWebSocket(server);

// Serve a simple HTML page for the terminal
app.get('/ssh', (req, res) => {
    res.sendFile(path.join(__dirname, 'terminal.html'));
});

// Health endpoints
app.get('/health', (req, res) => res.send('OK'));
app.get('/', (req, res) => res.send('Bot is running'));

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`🌐 Web SSH available at http://localhost:${PORT}/ssh`);
});

// Discord bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});
client.login(process.env.TOKEN).catch(err => {
    console.error('Discord login failed:', err.message);
});
