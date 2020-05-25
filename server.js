const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uuid = require('uuid');
const _ = require('lodash');

const PORT = process.env.PORT || 5000;
const rooms = {};

const joinRoom = (socket, room) => {
  room.sockets.push(socket);
  socket.join(room.id, () => {
    socket.roomId = room.id;
    console.log(socket.id, "Joined", room.id);
  });
};

const leaveRooms = (socket) => {
  const roomsToDelete = [];
  for (const id in rooms) {
    const room = rooms[id];
    if (room.sockets.includes(socket)){
      socket.leave(id);
      room.sockets = room.sockets.filter((item) => item !== socket);
    }

    if (room.sockets.length == 0){
      roomsToDelete.push(room);
    }
  }

  for (const room of roomsToDelete){
    delete rooms[room.id];
  }
};

const beginRound = (socket, id) => {
  if (id && socket.id !== id) {
    return ;
  }

  const room = rooms[socket.roomId];
  if (!room){
    return ;
  }

  let isIt = null;
  const output = {};

  for (const client of room.sockets){
    if (_.isEmpty(isIt)){
      client.isIt = true;
      isIt = client;
    } else {
      client.isIt = false;
    }

    output[client.id] = {
      isIt: client.isIt
    }
  }

  for (const client of room.sockets) {
    client.emit('checkfit', output);
  }

  room.timeout = setTimeout(() => {
    beginRound(socket, null);
  }, 20*1000);

};

io.on('connection', (socket) => {

  socket.id = uuid;
  console.log('a user connected');

  socket.on('ready', () => {
    console.log(socket.id, "is ready!");
    const room = rooms[socket.roomId];
    if (room.sockets.length == 4) {
      for (const client of room.sockets) {
        client.emit('initGame');
      }
    }
  });

  socket.on('startGame', (data, callback) => {
    const room = rooms[socket.roomId];
    if (!room) {
      return ;
    }
    const others = [];
    for (const client of room.sockets){
      if (client === socket) {
        continue;
      }
      others.push({
        id: client.id,
        isIt: false
      });
    }

    const ack = {
      me: {
        id: socket.id,
        isIt: false
      }, 
      others
    };

    callback(ack);

    setTimeout(() => {
      beginRound(socket, null);
    }, 5000);
  });

  socket.on('played', (data) => {
    data = JSON.parse(data);
    const room = rooms[socket.roomId];
    if (!room) {
      return ;
    }
    for (const client of room.sockets){
      if (client == socket) {
        continue;
      }
      client.emit(socket.id, {
        isIt: socket.isIt
      });
    }
  });

  socket.on('getRoomNames', (data, callback) => {
    const roomNames = [];
    for (const id in rooms) {
      const {name} = rooms[id];
      const room = {name, id};
      roomNames.push(room);
    }
    callback(roomNames);
  });

  socket.on('createRoom', (roomName, callback) => {
    const room = {
      id: uuid(),
      name: roomName,
      sockets: []
    };
    rooms[room.id] = room;
    joinRoom(socket, room);
    callback();
  });

  socket.on('joinRoom', (roomId, callback) => {
    const room = rooms[roomId];
    joinRoom(socket, room);
    callback();
  });

  socket.on('leaveRoom', () => {
    leaveRooms(socket);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    leaveRooms(socket);
  });

});

http.listen(PORT, function () {
  console.log(`listening on *:${PORT}`);
});

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true,
        useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));
// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);
app.listen(PORT, () => console.log(`Server up and running on port ${PORT} !`));