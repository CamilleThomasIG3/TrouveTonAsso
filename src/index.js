const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const path = require('path')
const flash = require('connect-flash')
const MySQLStore = require('express-mysql-session')
const passport = require('passport')
const cookieSession = require('cookie-session')

const { database } = require('./keys')

//global variable
global.variable_globale = 0 //0 : normal, 1 : admin, 2 : super admin

//initialisation
const app = express()
require('./lib/passport')

//setting
app.set('port', process.env.PORT || 4000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'handlebars');
var hbs = require('handlebars');

//return true if it is an admin
hbs.registerHelper("Admin", function(options)
{
  if(global.variable_globale === 1){
    return options.fn(this)
  }
  return options.inverse(this)
});

//return false if it is an admin
hbs.registerHelper("notAdmin", function(options)
{
  if(global.variable_globale === 0){
    return options.fn(this)
  }
  return options.inverse(this)
});

//return true if it is a super admin
hbs.registerHelper("SuperAdmin", function(options)
{
  if(global.variable_globale === 2){
    return options.fn(this)
  }
  return options.inverse(this)
});


app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))

app.set('view engine', '.hbs')

//middleware
app.use(flash())
app.use(cookieSession({
  secret: 'trouvetonassomysqlnodesession',
  maxAge: 1*60*60*1000, //h m s ms
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}))
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())


//global variable
app.use((req, res, next) =>{
  app.locals.success = req.flash('success')
  app.locals.message = req.flash('message')
  app.locals.personne = req.user
  next()
})


//route
app.use(require('./routes'))
app.use(require('./routes/authentification'))
app.use('/association', require('./routes/association'))
app.use('/administrateur', require('./routes/admin'))
app.use('/super_administrateur', require('./routes/super_admin'))


//public
app.use(express.static(path.join(__dirname, 'public')))

//start server
app.listen(app.get('port'), () =>{
  console.log('Server on port ', app.get('port'))
})
