require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');

// Ambil API key dari environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Halo! Gunakan /gpt atau /llama diikuti pertanyaanmu.");
});

// Command /gpt
bot.onText(/\/gpt (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const prompt = match[1];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }]
    });
    bot.sendMessage(chatId, response.choices[0].message.content);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi error saat memanggil GPT-4.1-mini.");
  }
});

// Command /llama
bot.onText(/\/llama (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const prompt = match[1];

  try {
    const response = await openai.chat.completions.create({
      model: "llama-instruct",
      messages: [{ role: "user", content: prompt }]
    });
    bot.sendMessage(chatId, response.choices[0].message.content);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi error saat memanggil LLaMA Instruct.");
  }
});
