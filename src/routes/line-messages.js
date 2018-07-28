const Express = require('express')
const Lodash = require('lodash')
const { pg, setPagination } = require('../database')

const router = Express.Router()
router.get('/', async (req, res) => {
  try {
    const builder = setPagination(pg('line_messages'), req.query)
    if (req.query._search) {
      const subquery = pg('line_users')
        .select('code')
        .where('display_name', 'like', `%${req.query._search}%`)
        .orWhere('name', 'like', `%${req.query._search}%`)
      builder.where(chain => {
        chain
          .where('text', 'like', `%${req.query._search}%`)
          .orWhereIn('user_code', subquery)
      })
    }
    const rows = await builder
    res.status(200).json(
      rows.map(row => {
        return Lodash.mapKeys(row, (value, key) => Lodash.camelCase(key))
      })
    )
  } catch (err) {
    console.dir(err)
    res.sendStatus(500)
  }
})

module.exports = router
