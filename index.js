const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

(async () => {
  try {
    const res = await fetch('https://discord.com/api/v10/gateway');
    console.log('📡 Response status:', res.status, res.statusText);
    
    // Try to get the response as text first (in case it's not JSON)
    const text = await res.text();
    console.log('📄 Response preview (first 200 chars):', text.substring(0, 200));
    
    // If it's JSON, parse it
    try {
      const data = JSON.parse(text);
      console.log('✅ Discord API reachable, gateway URL:', data.url);
    } catch (e) {
      console.error('❌ Response is not JSON. Raw response saved above.');
    }
  } catch (err) {
    console.error('❌ Network error reaching Discord API:', err.message);
    process.exit(1);
  }
})();

// 1. Create the Discord client FIRST
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 2. Set up event listeners
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// 4. Your Express server (keep this as is)
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot is running'));

app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});

// 3. THEN login (using the client that now exists)
console.log("Attempting Discord login...");
const loginTimeout = setTimeout(() => {
    console.error("❌ Login timed out after 10 seconds");
    process.exit(1);
}, 10000);

client.login(process.env.TOKEN)
  .then(() => {
    clearTimeout(loginTimeout); // Cancel the timeout if login succeeds
    console.log("✅ Login successful!");
  })
  .catch(err => {
    clearTimeout(loginTimeout);
    console.error("❌ Login failed:", err.message);
    process.exit(1);
  });
