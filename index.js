const mineflayer = require("mineflayer");

// 🎮 بيانات السيرفر
const host = "GOOLDENs2.aternos.me"; // غيرها لو سيرفرك اختلف
const port = 56511;

// 📌 لستة بوتات SMP (Admins)
const smpBots = [
  { username: "SMP_Admin1" },
  { username: "SMP_Admin2" },
  { username: "SMP_Admin3" }
];

// 📌 لستة بوتات Minigames
const mgBots = [
  { username: "MG_Admin1" },
  { username: "MG_Admin2" },
  { username: "MG_Admin3" }
];

// 📌 دالة تشغيل البوت
function createBot({ username }) {
  const bot = mineflayer.createBot({
    host,
    port,
    username,
  });

  bot.on("login", () => {
    console.log(`[✅] ${username} دخل السيرفر`);
  });

  bot.on("end", () => {
    console.log(`[⚠️] ${username} خرج. بيحاول يرجع...`);
    setTimeout(() => createBot({ username }), 5000); // يحاول يرجع بعد 5 ثواني
  });

  bot.on("error", (err) => {
    console.log(`[❌] ${username} Error: ${err.message}`);
  });
}

// 🚀 شغل بوتات SMP
smpBots.forEach(botInfo => createBot(botInfo));

// 🚀 شغل بوتات Minigames
mgBots.forEach(botInfo => createBot(botInfo));
