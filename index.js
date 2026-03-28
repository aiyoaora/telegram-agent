require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

// =====================
// Setup Telegram
// =====================
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// =====================
// Setup OpenAI
// =====================
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// =====================
// Memory sederhana
// =====================
const chatMemory = {}; // { chatId: [ { role, content } ] }

// =====================
// Fungsi untuk BlueSminds
// =====================
async function callBlueSminds(prompt) {
  try {
    const response = await axios.post(
      'https://api.bluesminds.com/v1/chat',
      { model: "gpt-4.1-mini", prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.BLUESMINDS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.answer || "BlueSminds tidak memberikan jawaban.";
  } catch (err) {
    console.error('BlueSminds Error:', err.response?.data || err.message);
    return "⚠️ Error saat memanggil BlueSminds.";
  }
}

// =====================
// Fungsi untuk OpenAI
// =====================
async function callOpenAI(chatId, prompt) {
  try {
    if (!chatMemory[chatId]) chatMemory[chatId] = [];

    chatMemory[chatId].push({ role: "user", content: prompt });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: chatMemory[chatId]
    });

    const answer = completion.choices[0].message.content;
    chatMemory[chatId].push({ role: "assistant", content: answer });

    return answer;
  } catch (err) {
    console.error('OpenAI Error:', err.response?.data || err.message);

    if (err.code === 'insufficient_quota' || err.status === 429) {
      console.log('Fallback ke BlueSminds karena OpenAI quota habis');
      return await callBlueSminds(prompt);
    }

    return "⚠️ Error saat memanggil OpenAI.";
  }
}

// =====================
// Telegram Commands
// =====================
bot.onText(/\/blue (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const prompt = match[1];

  bot.sendMessage(chatId, "🤖 Memproses lewat BlueSminds...");
  const answer = await callBlueSminds(prompt);
  bot.sendMessage(chatId, answer);
});

bot.onText(/\/openai (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const prompt = match[1];

  bot.sendMessage(chatId, "🤖 Memproses lewat OpenAI...");
  const answer = await callOpenAI(chatId, prompt);
  bot.sendMessage(chatId, answer);
});

// =====================
// Default response
// =====================
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text.startsWith('/blue') && !msg.text.startsWith('/openai')) {
    bot.sendMessage(chatId, "Gunakan /blue <pertanyaan> atau /openai <pertanyaan>");
  }
});
