const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const { ProxyAgent, setGlobalDispatcher } = require('undici');
const { HttpsProxyAgent } = require('https-proxy-agent');

(async () => {
  try {
    // ==================== PROXY CONFIGURATION ====================
    const PROXY_URL = process.env.PROXY_URL; // Must be http:// or https://
    console.log('🔍 PROXY_URL from env:', PROXY_URL ? 'set' : 'not set');

    if (PROXY_URL) {
      console.log('🔌 HTTP proxy detected, configuring...');

      // For HTTP requests (undici)
      const proxyAgent = new ProxyAgent(PROXY_URL);
      setGlobalDispatcher(proxyAgent);
      console.log('✅ Global undici proxy configured');

      // For WebSocket
      const wsAgent = new HttpsProxyAgent(PROXY_URL);
      global.wsProxyAgent = wsAgent;
      console.log('✅ WebSocket proxy agent configured');
    } else {
      console.log('⚠️ No PROXY_URL set, using direct connection');
    }

    // ==================== START EXPRESS SERVER ====================
    const app = express();
    const PORT = process.env.PORT || 10000;
    app.get('/', (req, res) => res.send('Bot is running'));
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌍 HTTP server listening on port ${PORT} at 0.0.0.0`);
    });

    // ==================== TOKEN VALIDATION ====================
    const token = process.env.TOKEN;
    console.log('🔑 Token exists?', token ? 'YES' : 'NO');

    if (!token) throw new Error('❌ TOKEN missing');

    // ==================== DISCORD CLIENT ====================
    const clientOptions = { intents: [GatewayIntentBits.Guilds] };
    if (global.wsProxyAgent) {
      clientOptions.ws = { agent: global.wsProxyAgent };
      console.log('🔌 WebSocket will use proxy agent');
    }

    const client = new Client(clientOptions);
    client.once('ready', () => console.log(`✅ Logged in as ${client.user.tag}`));

    // ==================== LOGIN ====================
    console.log('🚀 Attempting Discord login...');
    await client.login(token);
    console.log('✅ Login successful!');

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
