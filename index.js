const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');

// ===== Bot Telegram =====
const TOKEN = 'TOKEN_BOT_ANDA'; // Ganti dengan token botmu
const bot = new TelegramBot(TOKEN, { polling: true });

// ===== Data paket =====
const PACKAGE_DATA = {
  weight: '1',   // kg
  length: '10',  // cm
  width: '10',   // cm
  height: '10'   // cm
};

// ===== Login Indopaket =====
const INDOPAKET_LOGIN_URL = 'https://www.indopaket.co.id/login'; // Ganti URL asli
const USERNAME = 'email_anda';   // Ganti email login
const PASSWORD = 'password_anda'; // Ganti password

async function kirimPaket() {
  const browser = await puppeteer.launch({ headless: false }); // headless: true untuk server
  const page = await browser.newPage();
  await page.goto(INDOPAKET_LOGIN_URL, { waitUntil: 'networkidle2' });

  // Login
  await page.type('input[name="email"]', USERNAME);
  await page.type('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]'); // ganti selector sesuai button login
  await page.waitForTimeout(5000);

  // Buka halaman form pengiriman
  await page.goto('https://www.indopaket.co.id/create-shipment', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(3000);

  // Isi form paket otomatis
  await page.type('input[name="weight"]', PACKAGE_DATA.weight);
  await page.type('input[name="length"]', PACKAGE_DATA.length);
  await page.type('input[name="width"]', PACKAGE_DATA.width);
  await page.type('input[name="height"]', PACKAGE_DATA.height);

  // Submit form
  await page.click('button[type="submit"]'); // ganti selector sesuai button submit
  await page.waitForTimeout(5000);

  // Ambil status (contoh ambil teks alert sukses)
  let status = '';
  try {
    status = await page.$eval('.alert-success', el => el.textContent);
  } catch {
    status = 'Gagal mengirim paket atau elemen konfirmasi tidak ditemukan.';
  }

  await browser.close();
  return status;
}

// ===== Command Bot Telegram =====
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Halo! Bot siap mengirim paket Indopaket otomatis dengan berat 1kg dan dimensi 10x10x10 cm.\nKetik /kirim untuk mengirim paket.');
});

bot.onText(/\/kirim/, async (msg) => {
  bot.sendMessage(msg.chat.id, 'Sedang mengirim paket...');
  const result = await kirimPaket();
  bot.sendMessage(msg.chat.id, `Hasil: ${result}`);
});
