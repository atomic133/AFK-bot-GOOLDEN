const mineflayer = require('mineflayer');
require('dotenv').config();

const SERVER_IP = process.env.SERVER_IP;
const SERVER_PORT = parseInt(process.env.SERVER_PORT);

const SMP_BOT_COUNT = 2;
const JOIN_DELAY = 5000;

function createSmpBot(i) {
  const bot = mineflayer.createBot({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: `SMP_Admin${i}`,
  });

  bot.on('login', () => {
    console.log(`🌍 SMP_Admin${i} دخل السيرفر (SMP)`);
    setTimeout(() => {
      bot.chat('/vanish');
    }, 3000);
  });

  bot.on('end', () => {
    console.log(`❌ SMP_Admin${i} خرج .. بيحاول يدخل تاني`);
    setTimeout(() => createSmpBot(i), 10000);
  });

  bot.on('error', err => console.log(`⚠️ SMP_Admin${i} Error:`, err.message));
}

(async () => {
  for (let i = 1; i <= SMP_BOT_COUNT; i++) {
    setTimeout(() => createSmpBot(i), i * JOIN_DELAY);
  }
})();
