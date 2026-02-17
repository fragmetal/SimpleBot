const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. Create the Discord client FIRST
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 2. Set up event listeners
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// 3. THEN login (using the client that now exists)
console.log("Attempting Discord login...");
client.login(process.env.TOKEN)
  .then(() => {
    console.log("✅ Login successful!");
  })
  .catch(err => {
    // This will print the actual error reason
    console.error("❌ Login failed:", err.message);
    // Optional: exit the process so Render restarts it
    process.exit(1);
  });

// 4. Your Express server (keep this as is)
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot is running'));

app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});
