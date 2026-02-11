const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');

// ===== BOT TELEGRAM =====
const TOKEN = process.env.TELEGRAM_BOT_TOKEN; // token bot dari Railway ENV
const bot = new TelegramBot(TOKEN, { polling: true });

// ===== DATA PAKET =====
const PACKAGE_DATA = {
  weight: '1',   // kg
  length: '10',  // cm
  width: '10',   // cm
  height: '10'   // cm
};

// ===== LOGIN INDOPAKET =====
const INDOPAKET_LOGIN_URL = 'https://www.indopaket.co.id/login'; // URL login
const INDOPAKET_FORM_URL = 'https://www.indopaket.co.id/create-shipment'; // URL form pengiriman
const USERNAME = process.env.INDOPAKET_EMAIL;   // email login dari ENV Railway
const PASSWORD = process.env.INDOPAKET_PASSWORD; // password login dari ENV Railway

// ===== FUNGSI AUTOMATISASI =====
async function kirimPaket() {
  let status = '';
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    // ===== LOGIN =====
    await page.goto(INDOPAKET_LOGIN_URL, { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', USERNAME);
    await page.type('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]'); // sesuaikan selector login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // ===== BUKA FORM PENGIRIMAN =====
    await page.goto(INDOPAKET_FORM_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    // ===== ISI FORM =====
    await page.type('input[name="weight"]', PACKAGE_DATA.weight);
    await page.type('input[name="length"]', PACKAGE_DATA.length);
    await page.type('input[name="width"]', PACKAGE_DATA.width);
    await page.type('input[name="height"]', PACKAGE_DATA.height);

    // ===== SUBMIT FORM =====
    await page.click('button[type="submit"]'); // sesuaikan selector submit
    await page.waitForTimeout(5000);

    // ===== AMBIL STATUS =====
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
    'Halo! Bot Titip Paket Indopaket siap mengirim paket otomatis.\n' +
    'Ketik /kirim untuk mengirim paket dengan berat 1kg dan dimensi 10x10x10 cm.'
  );
});

// /kirim
bot.onText(/\/kirim/, async (msg) => {
  bot.sendMessage(msg.chat.id, 'Sedang mengirim paket...');
  const result = await kirimPaket();
  bot.sendMessage(msg.chat.id, `Hasil: ${result}`);
});
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
