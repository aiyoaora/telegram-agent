const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
const axios = require('axios');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askGroq(prompt) {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: "You are an AI crypto automation agent." },
        { role: "user", content: prompt }
      ]
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  return res.data.choices[0].message.content;
}

async function askGPT(prompt) {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }]
  });
  return res.choices[0].message.content;
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    return bot.sendMessage(chatId, "🤖 Hybrid AI Agent aktif");
  }

  try {
    let reply = await askGroq(text);

    if (!reply || reply.length < 5) {
      reply = await askGPT(text);
    }

    bot.sendMessage(chatId, reply);

  } catch (e) {
    bot.sendMessage(chatId, "error: " + e.message);
  }
});
