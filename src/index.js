const BodyParser = require('body-parser')
const Express = require('express')
const Morgan = require('morgan')
const routes = require('./routes')

const app = Express()
app.use(BodyParser.json())
app.use(BodyParser.urlencoded({ extended: true }))
app.use(Morgan('dev'))
app.use('/', routes)

const port = process.env.PORT || 8081

app.listen(port, () => {
  console.log('- - - - - - - - - - - - - - - - - - - - - - - - - ')
  console.log(`- Express is running op port: ${port}`)
  console.log('- - - - - - - - - - - - - - - - - - - - - - - - - ')
})
