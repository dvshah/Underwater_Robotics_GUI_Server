var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var qs = require('querystring');

var app = express();
var expressWs = require('express-ws')(app);

let arduino_switch = "OFF"; 
let arduinoSocket;

app.get('/', function(req, res){
    //arduinoSocket.send(arduino_switch);
    res.sendfile('./views/home.html');
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
    if(arduino_switch=="OFF")
      ws.send("ON");
    else if(arduino_switch=="ON")
      ws.send("OFF");
    ws.on('message', function(msg) {
      arduino_switch = msg;
      arduinoSocket.send(msg);
      console.log(arduino_switch);
      console.log(`sending to ${activeConnections.length} connections`);
      activeConnections.forEach((socket)=>{
        try{
            if(arduino_switch=="OFF")
            socket.send("ON");
            else if(arduino_switch=="ON")
            socket.send("OFF");
        }catch(e){}
      });
    });
    console.log('socket', req.testing);
});
   

app.listen(8000);