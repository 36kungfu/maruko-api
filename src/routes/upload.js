const Express = require('express')
const Multer = require('multer')

const upload = Multer({ dest: __dirname + '/../../upload/' })

const router = Express.Router()
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file received')
    }
    return res.status(200).json(req.file.filename)
  } catch (err) {
    console.dir(err)
    res.sendStatus(500)
  }
})
module.exports = router
