const mineflayer = require('mineflayer')
const express = require('express')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const collectBlock = require('mineflayer-collectblock').plugin
const pvp = require('mineflayer-pvp').plugin
const mcDataLoader = require('minecraft-data')

// ====== إعداد السيرفر ======
const serverHost = "GOLDEN-u8nn.aternos.me"
const serverPort = 23761

// أسماء البوتات
const botNames = ["GOOLDENBOT1", "GOOLDENBOT2", "GOOLDENBOT3"]

// باسورد
const BOT_PASSWORD = "7717"

// رسائل عشوائية
const randomMessages = [
  "عاملين ايه؟ 😃",
  "لقيت دايموند 🔥",
  "😂😂 انا تايه",
  "مين عنده اكل؟ 🍗",
  "في كهف مرعب هنا 😱",
  "يلا نبني قلعة 🏰",
  "ايه الاخبار يا شباب؟ 🙌"
]

// ====== إنشاء بوت ======
function createBot(username) {
  let bot
  function startBot() {
    bot = mineflayer.createBot({
      host: serverHost,
      port: serverPort,
      username: username,
      version: "1.20.1"
    })

    bot.loadPlugin(pathfinder)
    bot.loadPlugin(collectBlock)
    bot.loadPlugin(pvp)

    bot.once('spawn', () => {
      console.log(`✅ ${username} دخل السيرفر!`)
      bot.chat("✅ انا شغال!")

      const mcData = mcDataLoader(bot.version)
      const defaultMove = new Movements(bot, mcData)
      bot.pathfinder.setMovements(defaultMove)

      // ====== يلبس الدروع اللي معاه أو اللي اترمتله ======
      function equipArmor() {
        const armorSlots = ['helmet', 'chestplate', 'leggings', 'boots']
        armorSlots.forEach(slot => {
          const item = bot.inventory.items().find(i => i.name.includes(slot))
          if (item) bot.equip(item, slot).catch(() => {})
        })
      }
      setInterval(equipArmor, 10000)

      bot.on('playerCollect', (collector, item) => {
        if (collector.username === bot.username) setTimeout(equipArmor, 500)
      })

      // ====== يهاجم الموبز لو معاه سيف ======
      setInterval(() => {
        const mob = bot.nearestEntity(e => e.type === 'mob')
        if (mob) {
          const sword = bot.inventory.items().find(i => i.name.includes('sword'))
          if (sword) {
            bot.equip(sword, 'hand').then(() => {
              bot.pvp.attack(mob)
            }).catch(() => {})
          }
        }
      }, 5000)

      // ====== ياكل لو جعان ======
      setInterval(() => {
        if (bot.food < 16) {
          const foodItem = bot.inventory.items().find(i =>
            i.name.includes('bread') ||
            i.name.includes('beef') ||
            i.name.includes('porkchop') ||
            i.name.includes('chicken')
          )
          if (foodItem) bot.equip(foodItem, 'hand').then(() => bot.consume()).catch(() => {})
        }
      }, 8000)

      // ====== كلام عشوائي كل 45 ثانية ======
      setInterval(() => {
        const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)]
        bot.chat(msg)
      }, 45000)

      // ====== أوامر الشات ======
      bot.on('chat', async (player, message) => {
        if (player === bot.username) return
        const parts = message.trim().split(" ")
        const lowerMsg = message.toLowerCase()

        // أمر give me
        if (lowerMsg === "give me " + BOT_PASSWORD) {
          const target = bot.players[player]?.entity
          if (!target) return bot.chat(`❌ مش لاقيك يا ${player}`)
          bot.chat(`تمام يا ${player} 😃 جاي اديك الحاجات`)
          const goal = new goals.GoalNear(target.position.x, target.position.y, target.position.z, 1)
          await bot.pathfinder.goto(goal)
          for (const item of bot.inventory.items()) {
            try {
              await bot.tossStack(item)
            } catch (err) {}
          }
          return
        }

        // BOTNAME get me <resource> <count> <pass>
        if (lowerMsg.startsWith(bot.username.toLowerCase() + " get me")) {
          if (parts.length < 5) return
          const resource = parts[3]
          const count = parseInt(parts[4]) || 1
          const password = parts[5]

          if (password !== BOT_PASSWORD) return bot.chat(`❌ باسورد غلط يا ${player}`)

          let blockId = null
          if (resource === "wood") blockId = mcData.blocksByName.oak_log?.id
          if (resource === "diamond") blockId = mcData.blocksByName.diamond_ore?.id
          if (resource === "iron") blockId = mcData.blocksByName.iron_ore?.id

          if (!blockId) return bot.chat(`❌ مش فاهم يعني ايه ${resource}`)

          bot.chat(`⛏️ حاضر يا ${player}, بجمع ${count} ${resource}!`)
          let collected = 0
          while (collected < count) {
            const block = bot.findBlock({ matching: blockId, maxDistance: 32 })
            if (!block) break
            try {
              await bot.collectBlock.collect(block)
              collected++
            } catch (err) { break }
          }

          const target = bot.players[player]?.entity
          if (target) {
            const goal = new goals.GoalNear(target.position.x, target.position.y, target.position.z, 1)
            await bot.pathfinder.goto(goal)
            for (const item of bot.inventory.items()) {
              if (item.name.includes(resource)) await bot.tossStack(item)
            }
            bot.chat(`✅ خلصت يا ${player}`)
          }
          return
        }

        // BOTNAME follow me <pass>
        if (lowerMsg.startsWith(bot.username.toLowerCase() + " follow me")) {
          const password = parts.pop()
          if (password !== BOT_PASSWORD) return bot.chat(`❌ باسورد غلط`)
          const target = bot.players[player]?.entity
          if (!target) return bot.chat(`❌ مش لاقيك`)
          bot.chat(`👣 حاضر يا ${player}, جاي وراك!`)
          const goal = new goals.GoalFollow(target, 1)
          bot.pathfinder.setGoal(goal, true)
          return
        }

        // BOTNAME stop follow <pass>
        if (lowerMsg.startsWith(bot.username.toLowerCase() + " stop follow")) {
          const password = parts.pop()
          if (password !== BOT_PASSWORD) return bot.chat(`❌ باسورد غلط`)
          bot.pathfinder.setGoal(null)
          bot.chat(`🛑 تمام يا ${player}, وقفت المتابعة!`)
          return
        }

        // BOTNAME build tower <pass>
        if (lowerMsg.startsWith(bot.username.toLowerCase() + " build tower")) {
          const password = parts.pop()
          if (password !== BOT_PASSWORD) return bot.chat(`❌ باسورد غلط`)
          bot.chat(`🏗️ ببني برج يا ${player}`)
          let height = 5
          let i = 0
          const interval = setInterval(async () => {
            const block = bot.inventory.items().find(i => i.name.includes("stone") || i.name.includes("dirt"))
            if (!block) return clearInterval(interval)
            try {
              await bot.equip(block, 'hand')
              await bot.placeBlock(bot.blockAt(bot.entity.position.offset(0, -1, 0)), mineflayer.vec3(0, 1, 0))
              await bot.look(bot.entity.yaw, -Math.PI/2)
              bot.setControlState('jump', true)
              setTimeout(() => bot.setControlState('jump', false), 300)
            } catch (e) {}
            i++
            if (i >= height) clearInterval(interval)
          }, 1500)
          return
        }

        // BOTNAME stop build <pass>
        if (lowerMsg.startsWith(bot.username.toLowerCase() + " stop build")) {
          bot.chat(`🛑 تمام يا ${player}, وقفت البناء!`)
          bot.setControlState('jump', false)
          bot.pathfinder.setGoal(null)
          return
        }
      })
    })

    bot.on('error', err => console.log(`❌ Error ${username}:`, err))
    bot.on('end', () => {
      console.log(`⚠️ ${username} خرج, هيعيد الدخول بعد 30 ثانية...`)
      setTimeout(startBot, 30000)
    })
  }
  startBot()
}

botNames.forEach(name => createBot(name))

// ====== Web Server ======
const app = express()
app.get('/', (req, res) => res.send('✅ Bots running on Railway!'))
app.listen(process.env.PORT || 3000, () => console.log("🌍 Web server running"))
