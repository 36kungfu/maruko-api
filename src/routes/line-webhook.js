const Express = require('express')
const Lodash = require('lodash')
const { pg } = require('../database')
const lineClient = require('../line-client')

const router = Express.Router()
router.post('/', async (req, res) => {
  try {
    // recive content from user
    const text = req.body.events[0].message.text
    const userCode = req.body.events[0].source.userId
    const replyToken = req.body.events[0].replyToken
    if (replyToken === '00000000000000000000000000000000') {
      return res.sendStatus(200)
    }
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - ')
    console.log('- WEBHOOK_INPUTS')
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - ')
    console.log('USER_CODE:', userCode)
    console.log('REPLY_TOKEN:', replyToken)
    console.log('TEXT:', text)

    // check command
    switch (text) {
      case '/install':
        if (userCode !== process.env.LINE_ADMIN_UID) {
          await lineClient.replyText(replyToken, 'Administration Only')
          break
        }
        let result = null
        console.log('- - - - - - - - - - - - - - - - - - - - - - - - - ')
        console.log('- DROP_TABLE')
        console.log('- - - - - - - - - - - - - - - - - - - - - - - - - ')
        result = await pg.schema.dropTableIfExists('line_users')
        console.log("DROP_TABLE['line_users']:", result)
        result = await pg.schema.dropTableIfExists('line_messages')
        console.log("DROP_TABLE['line_messages']:", result)
        console.log('- - - - - - - - - - - - - - - - - - - - - - - - - ')
        console.log('- CREATE_TABLE')
        console.log('- - - - - - - - - - - - - - - - - - - - - - - - - ')
        result = await pg.schema.createTable('line_users', table => {
          table.increments()
          table.string('code')
          table.string('display_name')
          table.string('picture_url')
          table.string('status_message')
          table.string('name')
          table.string('group_code', 1)
          table.date('expired_at')
          table.timestamps(true, true)
        })
        console.log("CREATE_TABLE['line_users']:", result)
        result = await pg.schema.createTable('line_messages', table => {
          table.increments()
          table.string('user_code')
          table.string('text')
          table.timestamp('created_at').defaultTo(pg.fn.now())
        })
        console.log("CREATE_TABLE['line_messages']:", result)
        const adminProfile = await lineClient.getUserProfile(
          process.env.LINE_ADMIN_UID
        )
        let expiredAt = new Date()
        expiredAt.setFullYear(expiredAt.getFullYear() + 100)
        await pg('line_users').insert({
          code: adminProfile.userId,
          display_name: adminProfile.displayName,
          picture_url: adminProfile.pictureUrl,
          status_message: adminProfile.statusMessage,
          name: 'Administrator',
          group_code: 'a',
          expired_at: expiredAt.toISOString().substr(0, 10),
          created_at: pg.fn.now()
        })
        await lineClient.replyText(replyToken, 'INSTALL: OK')
        break
      default:
        await lineClient.replyText(
          replyToken,
          'Edkung Bot พร้อมให้บริการ กรุณาเลือกคำสั่ง'
        )
        break
    }

    let rows = null

    // insert new user to db.line_users
    rows = await pg('line_users')
    const row = rows.find(row => row.code === userCode)
    const user = Lodash.mapKeys(row, (value, key) => Lodash.camelCase(key))
    if (user == null) {
      const userProfile = await lineClient.getUserProfile(userCode)
      let expiredAt = new Date()
      expiredAt.setDate(expiredAt.getDate() + 1 + 7)
      await pg('line_users').insert({
        code: userCode,
        display_name: userProfile.displayName,
        picture_url: userProfile.pictureUrl,
        status_message: userProfile.statusMessage,
        name: null,
        group_code: 'g',
        expired_at: expiredAt.toISOString().substr(0, 10)
      })
    }

    // insert message to db.messages
    await pg('line_messages').insert({
      user_code: userCode,
      text
    })

    // ok response
    res.sendStatus(200)
  } catch (err) {
    console.dir(err)
    res.sendStatus(500)
  }
})

module.exports = router
