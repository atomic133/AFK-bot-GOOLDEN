const mineflayer = require('mineflayer')

// بيانات السيرفر
const host = "GOOLDENS2-YVzp.aternos.me"
const port = 19629

// لستة البوتات (اسم + نوع)
const bots = [
  { username: "SMB_Admin1", type: "smp" },
  { username: "SMB_Admin2", type: "smp" },
  { username: "SMB_Admin3", type: "smp" },
  { username: "MG_Admin1", type: "minigame" },
  { username: "MG_Admin2", type: "minigame" },
  { username: "MG_Admin3", type: "minigame" }
]

// تشغيل البوت
function createBot(botInfo) {
  const bot = mineflayer.createBot({
    host: host,
    port: port,
    username: botInfo.username,
    version: "1.20.6" // مهم جداً علشان يتماشى مع السيرفر
  })

  bot.once('spawn', () => {
    console.log(`[✅] ${botInfo.username} دخل السيرفر (${botInfo.type})`)
    bot.chat("/login yourPassword") // لو عندك بلجن AuthMe حط الباسورد هنا
  })

  bot.on('end', () => {
    console.log(`[⚠️] ${botInfo.username} خرج، بيعيد الدخول...`)
    setTimeout(() => createBot(botInfo), 5000) // إعادة دخول بعد 5 ثواني
  })

  bot.on('error', err => {
    console.log(`[❌] ${botInfo.username} Error:`, err.message)
  })
}

// إنشاء كل البوتات
bots.forEach(botInfo => createBot(botInfo))
