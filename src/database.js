const pg = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL
})
const Lodash = require('lodash')

const setPagination = (builder, { _fields = '', _p, _size = 20, _sort }) => {
  const fields = _fields.split(',').map(field => Lodash.snakeCase(field.trim()))
  const offset = _p == null ? null : (_p - 1) * _size
  const limit = _p == null ? null : _size
  const sort = _sort == null ? null : Lodash.snakeCase(_sort).replace('-', '')
  const direction = _sort == null ? null : _sort[0] === '-' ? 'desc' : 'asc'
  if (fields.length > 0) {
    builder.select(...fields)
  }
  if (offset != null) {
    builder.offset(offset)
  }
  if (limit != null) {
    builder.limit(limit)
  }
  if (sort != null) {
    builder.orderBy(sort, direction)
  }
  return builder
}

module.exports = { pg, setPagination }
