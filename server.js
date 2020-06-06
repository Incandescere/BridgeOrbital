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
app.use(index)

//For the rooms
const { cardsInitialState, startNewGame } = require('./client/src/util')
// in the tut they use this to modify states and keep track
let clientIds = []
var roomPK = 1
let rooms = []

function newGame(roomId) {
    console.log(`Game has started finally in ${roomId}`)
}

io.on('connection', (socket) => {
    clientIds.push(socket.id)
    // add to the list of sockets in game right now
    console.log('user connected', socket.id)

    socket.on('new_room', () => {
        rooms.push(socket.id)
        // adds a roomID to the array of roomIDs
        console.log(`Created a new room ${socket.id.value}`)
        printArray()
    })

    function printArray() {
        for (var i in rooms) {
            console.log(rooms[i])
        }
    }

    function inside(roomId) {
        for (let room in rooms) {
            // console.log(room, " ", roomId)
            if (rooms[room] === roomId) {
                return true
            }
        }
        return false
    }
    socket.on('joinRoom', (roomId) => {
        if (inside(roomId.value)) {
            socket.join(roomId, () => {
                console.log(`Joined room ${roomId}`)
            })
            socket.emit('RoomFound', 'Room is here')
        } else {
            socket.emit('NoRoom', () => {})
            console.log("Oops couldn't find room")
        }
        // rooms.map((room) => console.log('List of rooms:', room))
    })

    socket.on('startGame', (roomId) => {
        newGame(roomId) // we need some game logic here
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
        console.log('user disconnected')
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
// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB successfully connected'))
    .catch((err) => console.log(err))
// Passport middleware
app.use(passport.initialize())
// Passport config
require('./config/passport')(passport)

app.use('/api/users', users)
app.listen(PORT, () => console.log(`Server up and running on port ${PORT} !`))
