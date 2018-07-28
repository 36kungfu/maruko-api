const Express = require('express')
const Lodash = require('lodash')
const { pg, setPagination } = require('../database')

const router = Express.Router()
router
  .get('/', async (req, res) => {
    try {
      const builder = setPagination(pg('line_users'), req.query)
      if (req.query._search) {
        builder
          .where('display_name', 'like', `%${req.query._search}%`)
          .orWhere('status_message', 'like', `%${req.query._search}%`)
          .orWhere('name', 'like', `%${req.query._search}%`)
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
  .patch('/:id', (req, res) => {
    pg.transaction(async trx => {
      const rows = await trx('line_users')
        .update({
          name: req.body.name,
          group_code: req.body.groupCode,
          expired_at: req.body.expiredAt,
          updated_at: pg.fn.now()
        })
        .where('id', parseInt(req.params.id))
        .returning('*')
      res
        .status(200)
        .json(Lodash.mapKeys(rows[0], (value, key) => Lodash.camelCase(key)))
    }).catch(err => {
      console.dir(err)
      res.sendStatus(500)
    })
  })

module.exports = router
