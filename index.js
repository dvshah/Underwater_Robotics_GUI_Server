var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var qs = require('querystring');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');

var app = express();
var expressWs = require('express-ws')(app);

let arduino_switch = "OFF"; 
let arduinoSocket;

var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: true,
  saveUninitialized: false,
}));

var sessionChecker = (req, res, next) => {
  if (req.session.user) {
      res.redirect('/');
  } else {
      next();
      //res.redirect('/login');
  }    
};

var sessionCheckerHome = (req, res, next) => {
  if (!req.session.user) {
      res.redirect('/login');
  } else {
      next();
      //res.redirect('/login');
  }    
};

app.get('/', sessionCheckerHome, function(req, res){
    //arduinoSocket.send(arduino_switch);
    res.sendFile('views/home.html' , { root : __dirname});
    //res.sendFile('../views/home.html', {root: __dirname});
    //res.sendFile('./views/home.html');
})

let username = "devansh";
let password = "b871e4d8aaeaac3cea157f22fa9721ad4f3650b9d37fda912780b9da550c4f0e";

app.get('/login', sessionChecker, function(req, res){
  res.sendFile('views/login.html', {root : __dirname});
})

app.post('/login',urlencodedParser,function(req, res){
  let usr = req.body.name;
  let passwd = req.body.password;
  console.log(passwd);
  passwd = crypto.createHash('sha256').update(passwd).digest('hex');
  console.log(passwd);
  if(usr===username && passwd==password)
  {
    req.session.user = username;
    res.redirect('/');
  }
  else
  {
    res.redirect('/login');
  }
})

app.ws('/arduino', function(ws, req) {
    arduinoSocket = ws;
    ws.on('message', function(msg) {
      console.log(msg);
    });
    console.log('socket', req.testing);
});
const activeConnections = [];
app.ws('/admin', function(ws, req) {
    activeConnections.push(ws);
    if(arduino_switch==="OFF")
      ws.send("ON");
    else if(arduino_switch==="ON")
      ws.send("OFF");
    ws.on('message', function(msg) {
      arduino_switch = msg;
      if(arduinoSocket)
      {
        arduinoSocket.send(msg);
      }
      console.log(arduino_switch);
      console.log(`sending to ${activeConnections.length} connections`);
      activeConnections.forEach((socket)=>{
        try{
            if(arduino_switch==="OFF")
            socket.send("ON");
            else if(arduino_switch==="ON")
            socket.send("OFF");
        }catch(e){}
      });
    });
    console.log('socket', req.testing);
});
   
var port = process.env.PORT || 8080;
app.listen(port);