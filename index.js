require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');
const cron = require('node-cron');

// Setup API keys
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Halo! Pilih action: /gpt, /llama, /airdrop, /mint");
});

// GPT command
bot.onText(/\/gpt (.+)/, async (msg, match) => {
    const prompt = match[1];
    const chatId = msg.chat.id;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [{ role: "user", content: prompt }]
        });
        bot.sendMessage(chatId, response.choices[0].message.content);
    } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, "Error GPT request.");
    }
});

// LLaMA command
bot.onText(/\/llama (.+)/, async (msg, match) => {
    const prompt = match[1];
    const chatId = msg.chat.id;
    try {
        const response = await openai.chat.completions.create({
            model: "llama-instruct",
            messages: [{ role: "user", content: prompt }]
        });
        bot.sendMessage(chatId, response.choices[0].message.content);
    } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, "Error LLaMA request.");
    }
});

// Scheduler example (daily check)
cron.schedule('0 0 * * *', async () => {
    console.log("Daily task running...");
    // Panggil script automation di folder scripts/
});
