const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fetch = require('node-fetch'); // Install: npm install node-fetch@2

// ==================== PROXY CONFIGURATION ====================
const PROXY_URL = process.env.PROXY_URL; // e.g., socks5://user:pass@ip:port

if (PROXY_URL) {
  console.log('🔌 SOCKS5 proxy detected, configuring...');
  
  // Create SOCKS agent for all protocols
  const socksAgent = new SocksProxyAgent(PROXY_URL);
  
  // Override global fetch to use the SOCKS agent
  global.fetch = (url, options = {}) => {
    return fetch(url, { ...options, agent: socksAgent });
  };
  
  // Store agent for WebSocket (Discord.js will use it via clientOptions.ws.agent)
  global.wsProxyAgent = socksAgent;
  
  console.log('✅ Global fetch and WebSocket configured to use SOCKS5 proxy');
} else {
  console.log('⚠️ No PROXY_URL set, using direct connection');
  // Keep original fetch intact
  global.fetch = fetch;
}

// ==================== TEST GENERAL INTERNET CONNECTIVITY ====================
(async () => {
  try {
    console.log('🌐 Testing general internet connectivity (ipify)...');
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    console.log('✅ Public IP:', data.ip);
  } catch (err) {
    console.error('❌ General internet test failed:', err.message);
  }
})();

// ==================== DISCORD API TEST ====================
(async () => {
  try {
    console.log('🌐 Testing connection to Discord API...');
    const res = await fetch('https://discord.com/api/v10/gateway');
    console.log('📡 Discord API status:', res.status, res.statusText);
    const text = await res.text();
    console.log('📄 Discord API response preview:', text.substring(0, 200));
    try {
      const data = JSON.parse(text);
      console.log('✅ Gateway URL:', data.url);
    } catch {
      console.error('❌ Discord API response is not JSON.');
    }
  } catch (err) {
    console.error('❌ Discord API network error:', err.message);
  }
})();

// ==================== TOKEN VALIDATION ====================
const token = process.env.TOKEN;
console.log('🔑 Token exists?', token ? 'YES' : 'NO');
console.log('🔑 Token length:', token ? token.length : 'N/A');
console.log('🔑 Token starts with:', token ? token.substring(0, 5) : 'N/A');

if (!token) {
  console.error('❌ TOKEN environment variable is missing!');
}

// ==================== DISCORD CLIENT ====================
const clientOptions = {
  intents: [GatewayIntentBits.Guilds]
};
if (global.wsProxyAgent) {
  clientOptions.ws = {
    agent: global.wsProxyAgent
  };
  console.log('🔌 WebSocket will use proxy agent');
}

const client = new Client(clientOptions);

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ==================== LOGIN WITH TIMEOUT ====================
if (token) {
  console.log('🚀 Attempting Discord login...');
  const LOGIN_TIMEOUT_MS = 30000;
  const loginTimeout = setTimeout(() => {
    console.error(`❌ Login timed out after ${LOGIN_TIMEOUT_MS/1000} seconds`);
    process.exit(1);
  }, LOGIN_TIMEOUT_MS);

  client.login(token)
    .then(() => {
      clearTimeout(loginTimeout);
      console.log('✅ Login successful!');
    })
    .catch(err => {
      clearTimeout(loginTimeout);
      console.error('❌ Login failed:', err.message);
      process.exit(1);
    });
} else {
  console.log('⏸️ Skipping login because token is missing.');
}

// ==================== EXPRESS SERVER ====================
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot is running'));

app.listen(PORT, () => {
  console.log(`🌍 HTTP server listening on port ${PORT}`);
});
