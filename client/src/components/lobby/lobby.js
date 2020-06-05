import React, { Component } from 'react'
import Swal from 'sweetalert2'
import socketIOClient from 'socket.io-client'

//I have a feeling we need to integrate this with room
//to make use of only one socket at a time
const socket = socketIOClient('http://127.0.0.1:5000')

class Lobby extends Component {
    constructor() {
        super()
        this.state = {
            socket: socket,
            roomId: 0,
        }
    }

    getRoomId = () => {
        socket.emit('getRoomId')
        socket.on('roomId', (roomId) => {
            this.setState({
                roomId: roomId,
            })
            console.log(this.roomId)
        })
    }

    render() {
        const buttonStyle = {
            width: '350px',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '20px',
            fontFamily: 'Josephin Sans',
            background: 'black',
            borderRadius: '5px',
            color: 'white',
            margin: '10px 0px',
            padding: '10px 60px',
            cursor: 'pointer',
        }

        return (
            <div className="Lobby">
                <img
                    src={'https://static.guides.co/a/uploads/1063%2F4suits.png'}
                    alt="sad times"
                    className="image"
                ></img>
                <br />
                <button
                    style={buttonStyle}
                    onClick={() => {
                        Swal.fire({
                            title: 'You are making your own room',
                            text: 'Room code: ' + socket.id,
                            confirmButtonText: 'Join room',
                        }).then(() => {
                            socket.emit('new_room')
                            this.getRoomId()
                            console.log(this.roomId)
                            window.location = './room'
                        })
                    }}
                >
                    Create Room
                </button>

                <button
                    style={buttonStyle}
                    onClick={() => {
                        Swal.fire({
                            title: 'Please enter the room code to join:',
                            input: 'text',
                            confirmButtonText: 'Join',
                            showCancelButton: true,
                            showLoaderOnConfirm: true,
                        }).then((result) => {
                            socket.emit('joinRoom', result)
                            window.location = './room'
                        })
                    }}
                >
                    Join Room
                </button>
            </div>
        )
    }
}

export default Lobby
