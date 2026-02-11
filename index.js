const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const puppeteer = require('puppeteer');

// ===== BOT TELEGRAM =====
const token = process.env.BOT_TOKEN; // Token bot dari Railway ENV
const bot = new TelegramBot(token, { polling: true });

// ===== DIMENSI PAKET DEFAULT =====
const PACKAGE_DATA = {
  weight: '1',   // kg
  length: '10',  // cm
  width: '10',   // cm
  height: '10'   // cm
};

// ===== LOGIN INDOPAKET =====
const INDOPAKET_LOGIN_URL = 'https://www.indopaket.co.id/login'; // Ganti sesuai asli
const INDOPAKET_FORM_URL = 'https://www.indopaket.co.id/create-shipment'; // Ganti sesuai asli
const USERNAME = process.env.INDOPAKET_EMAIL;
const PASSWORD = process.env.INDOPAKET_PASSWORD;

// ===== EXPRESS SERVER =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running ✅');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ===== FUNGSI TITIP PAKET OTOMATIS =====
async function kirimPaket() {
  let status = '';
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    // LOGIN
    await page.goto(INDOPAKET_LOGIN_URL, { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', USERNAME);
    await page.type('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]'); // sesuaikan selector login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // BUKA FORM PENGIRIMAN
    await page.goto(INDOPAKET_FORM_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    // ISI FORM OTOMATIS (DIMENSI TITIP PAKET)
    await page.type('input[name="weight"]', PACKAGE_DATA.weight);
    await page.type('input[name="length"]', PACKAGE_DATA.length);
    await page.type('input[name="width"]', PACKAGE_DATA.width);
    await page.type('input[name="height"]', PACKAGE_DATA.height);

    // SUBMIT FORM
    await page.click('button[type="submit"]'); // sesuaikan selector submit
    await page.waitForTimeout(5000);

    // AMBIL STATUS KONFIRMASI
    try {
      status = await page.$eval('.alert-success', el => el.textContent.trim());
    } catch {
      status = 'Gagal mengirim paket atau elemen konfirmasi tidak ditemukan.';
    }

  } catch (err) {
    status = `Terjadi error: ${err.message}`;
  }

  await browser.close();
  return status;
}

// ===== BOT TELEGRAM MENU =====
bot.onText(/\/start/, (msg) => {
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

// ===== HANDLER PESAN =====
bot.on('message', async (msg) => {
  const text = msg.text;

  // Menu Titip Paket
  if (text === "📦 Titip Paket") {
    bot.sendMessage(msg.chat.id,
`Paket akan otomatis dikirim dengan data default:
📏 Dimensi: ${PACKAGE_DATA.length} x ${PACKAGE_DATA.width} x ${PACKAGE_DATA.height} cm
⚖️ Berat: ${PACKAGE_DATA.weight} kg

Silakan kirim alamat lengkap penerima.`);
  }

  // Menu Input Berat
  if (text === "⚖️ Input Berat") {
    bot.sendMessage(msg.chat.id, "Masukkan berat paket (kg):");
  }

  // Menu Format Order
  if (text === "📋 Format Order") {
    bot.sendMessage(msg.chat.id,
`FORMAT ORDER TITIP PAKET

Nama: Doni
No HP: 083830950123
Alamat: Jl. Pahlawan
Berat: 1
Dimensi: 10x10x10 cm
Metode Bayar:`);
  }

  // Deteksi input angka sebagai berat
  const beratMatch = text.match(/^(\d+)(kg)?$/i);
  if (beratMatch) {
    const berat = parseInt(beratMatch[1]);
    const hargaPerKg = 10000; // bisa diubah
    const total = berat * hargaPerKg;

    bot.sendMessage(msg.chat.id,
`📦 Berat diterima: ${berat} kg
💰 Estimasi biaya: Rp ${total.toLocaleString()}

Silakan kirim alamat lengkap penerima.`);
  }

  // Jika user mengetik "Kirim Paket", jalankan Puppeteer otomatis
  if (text.toLowerCase() === "kirim paket") {
    bot.sendMessage(msg.chat.id, "Sedang memproses titip paket otomatis...");
    try {
      const result = await kirimPaket();
      bot.sendMessage(msg.chat.id, `Hasil: ${result}`);
    } catch (err) {
      bot.sendMessage(msg.chat.id, `Terjadi error saat proses paket: ${err.message}`);
    }
  }
});
