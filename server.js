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

//for game logic
//const deck = require('./gamelogicks/deck.mjs')

app.use(index)

//For the rooms
const { cardsInitialState, startNewGame } = require('./client/src/util')
// in the tut they use this to modify states and keep track
let clientIds = []
let rooms = []

//for game logic
//=================================================================================
let deck = [
    'AS',
    '2S',
    '3S',
    '4S',
    '5S',
    '6S',
    '7S',
    '8S',
    '9S',
    'TS',
    'JS',
    'QS',
    'KS',
    'AH',
    '2H',
    '3H',
    '4H',
    '5H',
    '6H',
    '7H',
    '8H',
    '9H',
    'TH',
    'JH',
    'QH',
    'KH',
    'AC',
    '2C',
    '3C',
    '4C',
    '5C',
    '6C',
    '7C',
    '8C',
    '9C',
    'TC',
    'JC',
    'QC',
    'KC',
    'AD',
    '2D',
    '3D',
    '4D',
    '5D',
    '6D',
    '7D',
    '8D',
    '9D',
    'TD',
    'JD',
    'QD',
    'KD',
]

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // And swap it with the current element.
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }

    return array
}

shuffle(deck)
const hand0 = deck.slice(0, 13)
const hand1 = deck.slice(13, 26)
const hand2 = deck.slice(26, 39)
const hand3 = deck.slice(39, 52)
//=================================================================================

function newGame(roomId) {
    console.log(`newGame() called, game has started in ${roomId}`)
}

function printArray() {
    console.log('Active Rooms:\n---------------------------')
    for (var i in rooms) {
        console.log(
            `| ${rooms[i]}, ${JSON.stringify(
                io.sockets.adapter.rooms[rooms[i]]
            )} |`
        )
    }
    console.log('---------------------------')
}

function inside(roomId) {
    for (let room in rooms) {
        if (rooms[room] === roomId) {
            return true
        }
    }
    return false
}

function canJoin(rmid) {
    var room = io.sockets.adapter.rooms[rmid]
    return room.length < 4
}

io.on('connection', (socket) => {
    clientIds.push(socket.id)
    // add to the list of sockets in game right now
    console.log(socket.id, ' connected')

    socket.on('new_room', () => {
        if (!inside(socket.id)) {
            rooms.push(socket.id)
        }
        // adds a roomID to the array of roomIDs
        console.log(`Created a new room ${socket.id}`)
        printArray()
    })

    socket.on('joinRoom', (roomId) => {
        if (inside(roomId.value) && canJoin(roomId.value)) {
            socket.join(roomId.value, () => {
                console.log(`Socket ${socket.id} joined room ${roomId.value}`)
            })
            socket.emit('RoomFound')
            console.log(io.sockets.adapter.rooms[roomId.value])
        } else {
            let errmsg = ''
            if (!inside(roomId.value)) {
                errmsg = 'Room does not exist'
                console.log(
                    `Server emits: Oops room ${roomId.value} does not exist`
                )
            } else {
                errmsg = 'Room is full'
                console.log(
                    `Server emits: Oops room ${roomId.value} is filled to the brim`
                )
            }
            socket.emit('NoRoom', errmsg)
        }
    })

    //======================================================
    socket.on('dealQuery', (rmid) => {
        //var sockets = io.in(rmid)
        var handArr = [hand0, hand1, hand2, hand3]
        var handNo = 0
        // console.log(rmid)
        // console.log(io.sockets.adapter.rooms[rmid])
        if (io.sockets.adapter.rooms[rmid].length == 4) {
            io.of('/').adapter.clients([rmid], (err, clients) => {
                io.to(clients[0]).emit('dealHand', hand0)
                io.to(clients[1]).emit('dealHand', hand1)
                io.to(clients[2]).emit('dealHand', hand2)
                io.to(clients[3]).emit('dealHand', hand3)

                console.log(`All clients\n${clients}`)

                console.log(clients[0] + ' => ' + hand0)
                console.log(clients[1] + ' => ' + hand1)
                console.log(clients[2] + ' => ' + hand2)
                console.log(clients[3] + ' => ' + hand3)
            })
        } else {
            io.sockets.in(rmid).emit('playersNeeded')
            console.log('Not enough players yet')
        }
    })
    //======================================================

    socket.on('startGame', (roomId) => {
        newGame(roomId) // we need some game logic here
    })

    socket.on('displayCard', (str) => {
        console.log(
            `displayCard() on server called, card is ${str.slice(
                0,
                1
            )} of ${str.slice(1)}`
        )
    })

    socket.on('queryNumbers', (rmid) => {
        console.log(io.sockets.adapter.rooms[rmid].length)
        socket.emit('getNumbers', io.sockets.adapter.rooms[rmid].length)
    })

    socket.on('clickCard', () => {
        console.log('Clicking whatever the fck I want') // this should be like a big part of our code
    })

    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId)
        if (io.sockets.adapter.rooms[rmid].length == 0) {
            rooms.filter((room) => room != rmid)
        }
    })

    socket.on('disconnect', () => {
        console.log(socket.id, ' disconnected')
        // socket.leave(socket.roomId)
    })

    socket.on('getRoomId', () => {
        socket.emit('roomId', socket.roomId)
    })

    //for debugging
    socket.on('print', (result) => {
        console.log(`${result}`)
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
