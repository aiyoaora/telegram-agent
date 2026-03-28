require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

// Ambil token dari environment
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Init Telegram bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Init OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Command /gpt
bot.onText(/\/gpt (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const prompt = match[1];

  bot.sendMessage(chatId, '⏳ Tunggu sebentar, aku sedang berpikir...');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const answer = response.choices[0].message.content;
    bot.sendMessage(chatId, answer);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, '⚠️ Terjadi error saat memproses request OpenAI.');
  }
});

// Fallback: semua pesan non-command diproses AI
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/gpt')) return;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: text }],
      temperature: 0.7
    });

    const answer = response.choices[0].message.content;
    bot.sendMessage(chatId, answer);
  } catch (err) {
    console.error(err);
  }
});
