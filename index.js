require('dotenv').config();
const fs = require('fs-extra');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// ===== CONFIG =====
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const BLUESMIND_API_KEY = process.env.BLUESMIND_API_KEY;
const BLUESMIND_ENDPOINT = process.env.BLUESMIND_ENDPOINT || 'https://api.bluesmind.ai/v1/chat';
const MEMORY_FILE = './memory.json';
const MAX_MEMORY = 50; // maksimal pesan tersimpan per user

// ===== INITIALIZE BOT =====
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// ===== LOAD MEMORY =====
let memory = {};
if (fs.existsSync(MEMORY_FILE)) {
  try {
    memory = fs.readJsonSync(MEMORY_FILE);
  } catch (err) {
    console.error('Failed to read memory file:', err);
    memory = {};
  }
}

// ===== HELPER FUNCTION =====
async function getAIResponse(userId, message) {
  let context = memory[userId] || [];
  context.push({ role: 'user', content: message });

  // Truncate memory jika melebihi MAX_MEMORY
  if (context.length > MAX_MEMORY) {
    context = context.slice(context.length - MAX_MEMORY);
  }

  try {
    const response = await axios.post(
      BLUESMIND_ENDPOINT,
      { messages: context },
      { headers: { 'Authorization': `Bearer ${BLUESMIND_API_KEY}` } }
    );

    const reply = response.data?.reply || "Maaf, AI tidak merespons.";
    
    // Simpan pesan AI ke memory
    context.push({ role: 'assistant', content: reply });
    memory[userId] = context;
    fs.writeJsonSync(MEMORY_FILE, memory, { spaces: 2 });

    return reply;
  } catch (err) {
    console.error('Error from BlueSminds API:', err.response?.data || err.message);
    return "Terjadi error saat memproses permintaan AI.";
  }
}

// ===== BOT LISTENER =====
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  const reply = await getAIResponse(chatId, text);
  bot.sendMessage(chatId, reply);
});

// ===== STARTUP LOG =====
console.log('Telegram bot with persistent and auto-truncate memory is running...');
