const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const { SSHTerminal } = require('express-ssh-terminal'); // Add this

const app = express();
const PORT = process.env.PORT || 10000;

// ==================== YOUR EXISTING BOT CODE ====================
app.get('/health', (req, res) => res.send('OK'));
app.get('/', (req, res) => res.send('Bot is running'));

// ==================== ADD WEB SSH TERMINAL ====================
// This creates a terminal at /ssh that connects to localhost:22
// You'll need to authenticate with your server's SSH credentials
app.use('/ssh', SSHTerminal({
    ssh: {
        host: 'localhost',    // Connect to the container itself
        port: 22,             // SSH port inside container
        username: 'root',      // or your SSH username
        password: 'SecurePass123' // ⚠️ Use environment variable instead!
        // Or use privateKey: require('fs').readFileSync('/path/to/key')
    }
}));

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`🌐 Web SSH available at http://localhost:${PORT}/ssh`);
});

// ==================== DISCORD BOT ====================
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN).catch(err => {
    console.error('Discord login failed:', err.message);
});
