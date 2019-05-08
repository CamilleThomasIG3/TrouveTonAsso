const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const path = require('path')

//initialisation
const app = express()

//setting
app.set('port', process.env.PORT ||4000)
app.set('views', path.join(__dirname, 'views'))

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))

app.set('view engine', '.hbs')

//middleware
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//global variable
app.use((req, res, next) =>{
  next()
})

//route
app.use(require('./routes'))
app.use(require('./routes/authentification'))
app.use('/association', require('./routes/association'))
app.use('/association', require('./routes/association'))


//public
app.use(express.static(path.join(__dirname, 'public')))

//start server
app.listen(app.get('port'), () =>{
  console.log('Server on port ', app.get('port'))
})
