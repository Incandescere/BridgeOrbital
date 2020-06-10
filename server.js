const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const users = require('./routes/api/users')
var _ = require('lodash')
// For sockets
const express = require('express')
const path = require('path')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 5000
const index = require('./routes/index')

//for game logic 
//const deck = require('./gamelogicks/deck.mjs')

app.use(index)

//For the rooms
const { cardsInitialState, startNewGame } = require('./client/src/util')
// in the tut they use this to modify states and keep track
let clientIds = []
var roomPK = 1
let rooms = []

function newGame(roomId) {
    console.log(`newGame() called, game has started in ${roomId}`)
}

function printArray() {
    console.log('Active Rooms:\n---------------------------')
    for (var i in rooms) {
        console.log(`| ${rooms[i]}, ${io.sockets.adapter.rooms[rooms[i]].length} |`)
    }
    console.log('---------------------------')

}

function inside(roomId) {
    for (let room in rooms) {
        //console.log(room, " ", roomId)
        if (rooms[room] === roomId) {
            return true
        }
    }
    return false
}

function canJoin(rmid) {
    var room = io.sockets.adapter.rooms[rmid];
    return room.length < 4;
}

//sockies shit start
io.on('connection', (socket) => {
    clientIds.push(socket.id)
    // add to the list of sockets in game right now
    console.log(socket.id, ' connected')

    socket.on('new_room', (rmid) => {
        rooms.push(rmid)
        // adds a roomID to the array of roomIDs
        console.log(`Created a new room ${rmid}`)
        printArray()
    })

    socket.on('joinRoom', (roomId) => {

        if (inside(roomId.value) && (canJoin(roomId.value))) {
            socket.join(roomId.value, () => {
                console.log(`Socket ${socket.id} joined room ${roomId.value}`)
            })
            socket.emit('RoomFound', roomId.value)
            console.log(io.sockets.adapter.rooms[roomId.value])
        } else {
            let errmsg = ''
            if (!canJoin(roomId.value)) {
                errmsg = 'Room is full'
                console.log(`Server emits: Oops couldn't join room ${roomId.value}`)
            } else {
                errmsg = 'Room does not exist'
                console.log(`Server emits: Oops room ${roomId.value} does not exist`)
            }
            socket.emit('NoRoom', errmsg)

        }
        // rooms.map((room) => console.log('List of rooms:', room))
    })

    socket.on('startGame', (roomId) => {
        newGame(roomId) // we need some game logic here
    })

    socket.on('displayCard', (str) => {
        console.log(`displayCard() on server called, card is ${str.slice(0, 1)} of ${str.slice(1)}`)
    })

    socket.on('queryNumbers', (rmid) => {
        socket.emit('getNumbers', io.sockets.adapter.rooms[rmid].length)
    })

    socket.on('deal', () => {
        console.log('Dealing cards as of now') // we need game logic here as well
    })

    socket.on('clickCard', () => {
        console.log('Clicking whatever the fck I want') // this should be like a big part of our code
    })

    socket.on('leaveRoom', () => {
        socket.leave(socket.roomId)
    })

    socket.on('disconnect', () => {
        console.log(socket.id, ' disconnected')
        // socket.leave(socket.roomId)
    })

    socket.on('getRoomId', () => {
        socket.emit('roomId', socket.roomId)
    })
})

http.listen(PORT, () => console.log(`I am connected yayy`))

app.use(
    bodyParser.urlencoded({
        extended: false,
    })
)
app.use(bodyParser.json())
// DB Config
const db = require('./config/keys').mongoURI

// TEMPORARILY DISABLED DUE TO FAILURE TO CONNECT
// Connect to MongoDB

// mongoose
//     .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('MongoDB successfully connected'))
//     .catch((err) => console.log(err))


// Passport middleware
app.use(passport.initialize())
// Passport config
require('./config/passport')(passport)

app.use('/api/users', users)
app.listen(PORT, () => console.log(`Server up and running on port ${PORT} !`))