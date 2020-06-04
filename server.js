// For logging in
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const users = require('./routes/api/users')

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

// function syncRooms(clientId) {
//     ; (clientId ? io.to(clientId) : io).emit('nothing', rooms)
//     //idk what this does but it doesn't compile without this
// }

function newGame(roomId) {
    console.log(`Game has started finally in ${roomId}`)
}

io.on('connection', (socket) => {
    clientIds.push(socket.id)
    // add to the list of sockets in game right now
    console.log('user connected', socket.id)

    // socket.on('view_rooms', () => {
    //     syncRooms(client.id)
    //     //hypothetical feature we could implement
    // })

    socket.on('new_room', () => {
        const newRoomId = `Room_${roomPK++}`
        rooms.push(newRoomId)
        // adds a roomID to the array of roomIDs
        console.log(`Created a new room ${newRoomId}`)
        //syncRooms() // this part i am not sure tbh
    })

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId, () => {
            console.log(`Joined room ${roomId}`)
            //Eventually we will need to check if it is a valid room
            //being joined
        })
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
        socket.leave(socket.roomId)
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
