var express = require("express");
var http = require("http");
var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);

var globalId = 0;
var targets = [];

function constrain(value, limit) {
  return value / (1.0 / limit);
}

function createTarget() {
  var target = {
      id: globalId.toString(16),
      x: constrain(Math.random(), 0.9),
      y: constrain(Math.random(), 0.8),
      width: constrain(Math.random(), 0.08) + 0.08,
      height: constrain(Math.random(), 0.04) + 0.1,
      hue: Math.round(Math.random() * 360)
  };

  globalId++;
  targets.push(target);
  io.emit("targetCreated", target);
}

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));

app.get("/", function(req, res) {
    res.render("index");
});

function checkIntersections(x, y) {
  for (var i = 0; i < targets.length; i++) {
    var target = targets[i];
    if (target === undefined) continue;

    if (x > target.x && x < (target.x + target.width) && y > target.y && y < (target.y + target.height)) {
      io.emit("destroyed", target.id);
    }
  }
}

io.on("connection", function(socket) {
  socket.on("click", function(data) {
    io.emit("clickEvent", {x: data.x, y: data.y});
    checkIntersections(data.x, data.y);
  })
});

server.listen(3000);

setInterval(function() {
  if (Math.random() < 0.4) {
    console.log("created");
    createTarget();
  }
}, 1000);
