// Force logs to flush immediately (helps with Render's log streaming)
console.log = (msg) => { process.stdout.write(msg + '\n'); };
console.error = (msg) => { process.stderr.write(msg + '\n'); };

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// ==================== NETWORK TEST ====================
(async () => {
  try {
    console.log('🌐 Testing connection to Discord API...');
    const res = await fetch('https://discord.com/api/v10/gateway');
    console.log('📡 Response status:', res.status, res.statusText);

    const text = await res.text();
    console.log('📄 Response preview (first 200 chars):', text.substring(0, 200));

    try {
      const data = JSON.parse(text);
      console.log('✅ Discord API reachable, gateway URL:', data.url);
    } catch (e) {
      console.error('❌ Response is not JSON. Raw response above.');
      // Don't exit – maybe API is down but bot might still work?
    }
  } catch (err) {
    console.error('❌ Network error reaching Discord API:', err.message);
    process.exit(1); // Critical – if API is unreachable, bot can't work
  }
})();

// ==================== TOKEN VALIDATION ====================
const token = process.env.TOKEN;
console.log('🔑 Token length:', token ? token.length : 'MISSING');
console.log('🔑 Token starts with:', token ? token.substring(0, 5) : 'N/A');
if (!token || token.length < 50) {
  console.error('❌ Token seems invalid (missing or wrong length). Check Render environment variable.');
  process.exit(1);
}

// ==================== DISCORD CLIENT ====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    // Add more intents if needed, e.g.:
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
  ]
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ==================== LOGIN WITH TIMEOUT ====================
console.log("🚀 Attempting Discord login...");
const LOGIN_TIMEOUT_MS = 30000; // 30 seconds

const loginTimeout = setTimeout(() => {
  console.error(`❌ Login timed out after ${LOGIN_TIMEOUT_MS/1000} seconds`);
  process.exit(1);
}, LOGIN_TIMEOUT_MS);

client.login(token)
  .then(() => {
    clearTimeout(loginTimeout);
    console.log("✅ Login successful!");
  })
  .catch(err => {
    clearTimeout(loginTimeout);
    console.error("❌ Login failed:", err.message);
    process.exit(1);
  });

// ==================== EXPRESS SERVER (for Render) ====================
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot is running'));

app.listen(PORT, () => {
  console.log(`🌍 HTTP server listening on port ${PORT}`);
});
