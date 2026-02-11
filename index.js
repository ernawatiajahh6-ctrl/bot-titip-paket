const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

bot.onText(/\/start/,(msg) => {
  bot.sendMessage(msg.chat.id, "Bot Titip Paket Aktif ✅");
});
bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, "Silakan pilih layanan:", {
    reply_markup: {
      keyboard: [
        ["📦 Titip Paket"],
        ["💰 Cek Harga"],
        ["📋 Format Order"]
      ],
      resize_keyboard: true
    }
  });
});
bot.on('message', (msg) => {
  const text = msg.text;

  if (text === "📦 Titip Paket") {
    bot.sendMessage(msg.chat.id, "Silakan kirim detail paket:\n\nNama:\nAlamat:\nBerat:");
  }

  if (text === "💰 Cek Harga") {
    bot.sendMessage(msg.chat.id, "Masukkan berat paket (kg):");
  }

  if (text === "📋 Format Order") {
    bot.sendMessage(msg.chat.id,
`FORMAT ORDER TITIP PAKET

Nama: Doni
No HP: 083830950123
Alamat: Jl. pahlawan
Berat: 1
Metode Bayar:`);
  }
});
