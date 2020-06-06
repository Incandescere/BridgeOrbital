import React, { Component } from 'react'
import Swal from 'sweetalert2'
import openSocket from 'socket.io-client'

//I have a feeling we need to integrate this with room
//to make use of only one socket at a time

class Lobby extends Component {
    constructor(props) {
        super(props)
        this.state = {
            socket: openSocket('http://localhost:5000'),
        }
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
                            text: 'Room code: ' + this.state.socket.id,
                            confirmButtonText: 'Join room',
                        }).then(() => {
                            this.state.socket.emit('new_room')
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
                            this.state.socket.emit('joinRoom', result)
                            this.state.socket.on('NoRoom', () => {
                                Swal.fire({
                                    title: 'No such room exists',
                                }).then((window.location = './lobby'))
                            })
                            this.state.socket.on('RoomFound', () => {
                                window.location = './room'
                            })
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
