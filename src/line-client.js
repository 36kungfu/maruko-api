const { LineClient } = require('messaging-api-line')

const lineClient = LineClient.connect({
  accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
})

module.exports = lineClient
