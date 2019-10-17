const express = require("express"),
      session = require("express-session"),
      compression = require("compression"),
      bodyParser = require('body-parser')

let app = express()
const server = require("http").createServer(app)
const io = require('socket.io').listen(server)
const routes = require("./routes/main")

// one month cache period for static files
let cacheTime = 30 * 24 * 60 * 60 * 1000
// compress app responses (before sending to client)
app.use(compression())
// use the "public" directory to serve static files (and set cache time)
app.use(express.static(__dirname + "/public", {maxAge: cacheTime}))
// set express view engine to render Pug
app.set("view engine", "pug")
// url encoding
app.use(express.urlencoded({extended: true}))
// use environment variable SESSION_SECRET (must be defined when running from command line)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  authenticated: false
}))

function checkLoggedIn(request, response, next) {
  console.log(request.session.authenticated)
  if (request.session.authenticated == undefined){
    response.redirect('/login')
  }
  else{
    next()
  }
}

// redirect to login if not logged in yet
app.get('*', (request, response, next) => {
  if(request.url.indexOf('/login') == -1) {
    checkLoggedIn(request, response, next)
  }
  else{
    next()
  }
})

app.get('/logout', function(request, response, next) {
  request.session.authenticated = false
  request.session.destroy(function(error) {
    if(error) {
      return next(error)
    } else {
      return response.redirect('/login')
    }
  })
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// create routes for all the pages
for (let pages in routes){
  app.use(pages, routes[pages])
}

// io.sockets.on('connection', socket => {
//   socket.on('login', data => {
    
//   })
// })

server.listen(4000, () => {
  console.log("server is live on port 4000")
})
