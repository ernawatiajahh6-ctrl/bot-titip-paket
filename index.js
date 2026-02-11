const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');

// ===== BOT TELEGRAM =====
const TOKEN = 'TOKEN_BOT_ANDA'; // Ganti dengan token bot Telegram
const bot = new TelegramBot(TOKEN, { polling: true });

// ===== DATA PAKET =====
const PACKAGE_DATA = {
  weight: '1',   // kg
  length: '10',  // cm
  width: '10',   // cm
  height: '10'   // cm
};

// ===== LOGIN INDOPAKET =====
const INDOPAKET_LOGIN_URL = 'https://www.indopaket.co.id/login'; // Ganti URL login asli
const INDOPAKET_FORM_URL = 'https://www.indopaket.co.id/create-shipment'; // Ganti URL form pengiriman
const USERNAME = 'email_anda';   // Ganti dengan email login
const PASSWORD = 'password_anda'; // Ganti dengan password login

// ===== FUNGSI AUTOMATISASI =====
async function kirimPaket() {
  let status = '';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  try {
    // Login
    await page.goto(INDOPAKET_LOGIN_URL, { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', USERNAME);
    await page.type('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]'); // ganti selector sesuai button login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Buka form pengiriman
    await page.goto(INDOPAKET_FORM_URL, { waitUntil: 'networkidle2' });

    // Isi form paket
    await page.type('input[name="weight"]', PACKAGE_DATA.weight);
    await page.type('input[name="length"]', PACKAGE_DATA.length);
    await page.type('input[name="width"]', PACKAGE_DATA.width);
    await page.type('input[name="height"]', PACKAGE_DATA.height);

    // Submit form
    await page.click('button[type="submit"]'); // ganti selector sesuai button submit
    await page.waitForTimeout(5000);

    // Ambil status konfirmasi
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

// ===== BOT TELEGRAM COMMANDS =====

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Halo! Bot Indopaket siap mengirim paket otomatis.\nKetik /kirim untuk mengirim paket dengan berat 1kg dan dimensi 10x10x10 cm.'
  );
});

// /kirim
bot.onText(/\/kirim/, async (msg) => {
  bot.sendMessage(msg.chat.id, 'Sedang mengirim paket...');
  const result = await kirimPaket();
  bot.sendMessage(msg.chat.id, `Hasil: ${result}`);
});
