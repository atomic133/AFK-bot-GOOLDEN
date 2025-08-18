const mineflayer = require('mineflayer');
require('dotenv').config();

const SERVER_IP = process.env.SERVER_IP;
const SERVER_PORT = parseInt(process.env.SERVER_PORT);

const MINIGAMES_BOT_COUNT = 8;
const JOIN_DELAY = 5000;

function createMinigamesBot(i) {
  const bot = mineflayer.createBot({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: `MG_Admin${i}`,
  });

  bot.on('login', () => {
    console.log(`🎮 MG_Admin${i} دخل السيرفر (Minigames)`);
    setTimeout(() => {
      bot.chat('/vanish');
    }, 3000);
  });

  bot.on('end', () => {
    console.log(`❌ MG_Admin${i} خرج .. بيحاول يدخل تاني`);
    setTimeout(() => createMinigamesBot(i), 10000);
  });

  bot.on('error', err => console.log(`⚠️ MG_Admin${i} Error:`, err.message));
}

(async () => {
  for (let i = 1; i <= MINIGAMES_BOT_COUNT; i++) {
    setTimeout(() => createMinigamesBot(i), i * JOIN_DELAY);
  }
})();
