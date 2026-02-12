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
        ["⚖️ Input Berat"],
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

  if (text === "⚖️ Input Berat") {
    bot.sendMessage(msg.chat.id, "Masukkan berat paket (kg):");
  }

  if (text === "📋 Format Order") {
    bot.sendMessage(msg.chat.id,
`FORMAT ORDER TITIP PAKET

Data Pengirim
Nama : Tom
No Hp : 08123456789
Data Penerima : Jerry
No Hp : 08123456789
Kode Toko : F6b3 Juntinyuat
`);
  }
});
bot.on('message', (msg) => {
  const text = msg.text;

  // Deteksi jika user kirim angka atau angka + kg
  const beratMatch = text.match(/^(\d+)(kg)?$/i);

  if (beratMatch) {
    const berat = parseInt(beratMatch[1]);
    const hargaPerKg = 10000; // kamu bisa ubah
    const total = berat * hargaPerKg;

    bot.sendMessage(msg.chat.id,
`📦 Berat diterima: ${berat} kg
💰 Estimasi biaya: Rp ${total.toLocaleString()}

Silakan kirim alamat lengkap penerima.`);
  }
});
