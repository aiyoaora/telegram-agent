require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');

// ==========================
// 1️⃣ Setup API Keys
// ==========================
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;  // Dari Railway env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;  // Dari Railway env

if (!TELEGRAM_TOKEN || !OPENAI_API_KEY) {
  console.error("⚠️ Pastikan TELEGRAM_TOKEN dan OPENAI_API_KEY sudah di-set di Railway!");
  process.exit(1);
}

// Telegram bot init
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// OpenAI setup
const openai = new OpenAIApi(new Configuration({
  apiKey: OPENAI_API_KEY
}));

// ==========================
// 2️⃣ Helper function untuk AI response
// ==========================
async function getAIResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Kamu adalah teman ngobrol santai. Jawab dengan ramah, singkat, dan tidak formal." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,  // Lebih santai & kreatif
      max_tokens: 200
    });
    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI Error:", err.response?.data || err.message);
    return "Oops, ada yang error 😅";
  }
}

// ==========================
// 3️⃣ Telegram bot listener
// ==========================
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return; // skip jika bukan text

  // /start command
  if (text === '/start') {
    bot.sendMessage(chatId, "🤖 Halo! Aku teman AI-mu. Bisa chat santai atau gunakan perintah /gpt <pertanyaan>.");
    return;
  }

  // /gpt command
  if (text.startsWith('/gpt ')) {
    const prompt = text.replace('/gpt ', '').trim();
    if (!prompt) {
      bot.sendMessage(chatId, "Tolong tulis pertanyaan setelah /gpt ya 😊");
      return;
    }
    bot.sendMessage(chatId, "⏳ Tunggu sebentar, aku sedang berpikir...");
    const response = await getAIResponse(prompt);
    bot.sendMessage(chatId, response);
    return;
  }

  // Default reply → santai seperti teman
  bot.sendMessage(chatId, await getAIResponse(text));
});

// ==========================
// 4️⃣ Optional: handle errors
// ==========================
bot.on("polling_error", (err) => {
  console.error("Polling Error:", err);
});
