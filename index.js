const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatId, '🤖 Agent aktif! Kirim perintah.');
    } else {
        bot.sendMessage(chatId, `Kamu bilang: ${text}`);
    }
});
