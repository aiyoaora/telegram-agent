require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');

// Inisialisasi bot Telegram
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Inisialisasi OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Listener pesan
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: text }],
    });

    const reply = response.data.choices[0].message.content;
    bot.sendMessage(chatId, reply);

  } catch (error) {
    console.error(error);

    if (error.code === 'insufficient_quota' || error.status === 429) {
      bot.sendMessage(chatId, "⚠️ Kuota OpenAI habis, coba nanti.");
    } else {
      bot.sendMessage(chatId, "⚠️ Terjadi kesalahan saat memproses pesan.");
    }
  }
});

console.log("Bot Telegram berjalan...");
