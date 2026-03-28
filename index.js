const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

const token = process.env.TELEGRAM_TOKEN;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatId, '🤖 AI Agent aktif!');
        return;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                { role: "system", content: "You are a helpful AI agent focused on crypto, games, and making money." },
                { role: "user", content: text }
            ]
        });

        const reply = response.choices[0].message.content;
        bot.sendMessage(chatId, reply);

    } catch (err) {
        bot.sendMessage(chatId, "AI error: " + err.message);
    }
});
