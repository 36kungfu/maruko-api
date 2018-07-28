const Express = require('express')
const Path = require('path')
const lineMessages = require('./line-messages')
const lineUsers = require('./line-users')
const lineWebhook = require('./line-webhook')
const upload = require('./upload')

const router = Express.Router()

router.use('/api/line-messages', lineMessages)
router.use('/api/line-users', lineUsers)
router.use('/api/line-webhook', lineWebhook)
router.use('/api/files', Express.static(Path.join(__dirname, '../../upload')))
router.use('/api/upload', upload)
router
  .get('/api/version', (req, res) => {
    res.status(200).send('1.0')
  })
  .get('*', (req, res) => {
    res.status(404).send()
  })

module.exports = router
