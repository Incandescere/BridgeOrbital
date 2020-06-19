import React, { Component, useState } from 'react'
import socketIOClient from 'socket.io-client'
import Swal from 'sweetalert2'
import { Card, HandStyles, CardStyles, Hand } from 'react-casino'
import socket from 'socket.io-client/lib/socket'

const ENDPOINT = 'http://127.0.0.1:5000'

const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
    },
    buttonsStyling: false,
})

const RoomConfigurator = (socket) => {
    return swalWithBootstrapButtons
        .fire({
            title: 'Game Lobby',
            text: 'Create a room or join an existing game',
            showCancelButton: true,
            confirmButtonText: 'Join Existing Game',
            cancelButtonText: 'Create Room',
            reverseButtons: true,
        })
        .then((result) => {
            //confirm (Join existing game)
            if (result.value) {
                swalWithBootstrapButtons
                    .fire({
                        title: 'Please enter the room code to join:',
                        input: 'text',
                        confirmButtonText: 'Join',
                        showCancelButton: true,
                        showLoaderOnConfirm: true,
                    })
                    .then((result) => {
                        //queries to join room
                        socket.emit('joinRoom', result)

                        //fails to find or join a room
                        socket.on('NoRoom', (errmsg) => {
                            swalWithBootstrapButtons
                                .fire({
                                    title: `${errmsg}\n Redirecting back to lobby`,
                                    timer: 2000,
                                })
                                .then((window.location = './room'))
                        })

                        //succeeds in finding and joining the room
                        socket.on('RoomFound', (rmid) => {
                            //window.location = './room'
                            //(cannot do this, as the componentdidmount will trigger and break socket connection)

                            // this.setState((state) => {
                            //     roomId: result.value
                            // })
                            socket.emit('queryNumbers', rmid)
                            socket.on('getNumbers', (inRoom) => {
                                Swal.fire({
                                    title: `You have joined room ${rmid}, with ${inRoom} people`,
                                    timer: 2000,
                                })
                            })
                        })
                    })
            } else if (
                //cancel (create new game/room)
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons
                    .fire({
                        title: 'You are making your own room',
                        text: 'Room code: ' + socket.id,
                        confirmButtonText: 'Join room',
                    })
                    .then(() => {
                        socket.emit('new_room')
                        socket.emit('join', this.state.socket.id)
                        //window.location = './room'

                        //not sure if this is entirely correct
                        this.setState({
                            roomId: this.state.socket.id,
                            displayStart: false,
                        })
                    })
            }
        })
}

class Room extends Component {
    constructor(props) {
        super(props)
        const {
            match: { params },
        } = props

        this.state = {
            board: [],
            selected: {},
            deck: {}, // this one we need to link with backend and also react-casino
            collected: {},
            socket: socketIOClient(ENDPOINT),
            roomId: '',
            displayStart: true,
            hand: [],  //represents hand of client
            currCall: '',
        }
    }

    // componentDidMount() {
    //     this.RoomConfigurator()
    // }

    clickCard = () => {
        this.state.socket.emit('click_card')
    }

    startGame = () => {
        const {
            match: { params },
        } = this.props
        this.state.socket.emit('startGame', params.roomId)
    }

    dealQuery = () => {
        this.state.socket.emit('dealQuery', this.state.roomId)
        this.state.socket.on('dealHand', (hand) => {
            this.setState({
                hand: hand,
            })
            console.log(`${this.state.socket.id} rec\'d hando of ${this.state.hand}`)
        })
        this.state.socket.on('playersNeeded', () => {
            Swal.fire({
                title: 'Not enough players yet',
            })
        })
    }

    //=======================================================================================
    callProcess = () => {
        //console.log('starting call process')
        this.state.socket.emit('callStart', this.state.roomId)

        this.state.socket.on('startCallSuccess', () => {
            Swal.fire({
                title: "start calling!",
                input: 'text',
            }).then((result) => {
                this.state.socket.emit('callResult', (this.state.socket.id + " " + this.state.roomId + " " + result.value))
                this.state.currCall = this.state.socket.id + " " + result.value
            })
        })

        this.state.socket.on('startCallFail', () => {
            Swal.fire({
                title: 'Cannot start calling, not enough people',
                timer: 2000
            })
        })
    }
    //=======================================================================================

    render() {
        const { board, selected, socket, roomId, hand } = this.state

        //========================================================================
        // this.state.socket.on('dealHand', (hand) => {
        //     console.log(`recd' hand of ${hand}`)
        // })
        //========================================================================

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
            <div>
                <button
                    style={buttonStyle}
                    onClick={() => {
                        Swal.fire({
                            title: 'You are making your own room',
                            text: 'Room code: ' + this.state.socket.id,
                            confirmButtonText: 'Join room',
                        }).then(() => {
                            this.setState({
                                roomId: this.state.socket.id,
                            })
                            this.state.socket.emit('new_room')
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
                            this.state.socket.on('RoomFound', () => {
                                this.setState({
                                    roomId: result.value,
                                })
                            })
                            this.state.socket.on('NoRoom', (errmsg) => {
                                Swal.fire({
                                    title: errmsg,
                                    cancelButton: true,
                                }).then((window.location = './room'))
                            })
                        })
                    }}
                >
                    Join Room
                </button>
                <RoomHud
                    displayStart={true}
                    socket={this.state.socket}
                    roomId={this.state.roomId}
                />
                <React.Fragment>
                    <div style={{ position: 'relative' }}>
                        <Board
                            board={board}
                            selected={selected}
                            clickCard={this.clickCard}
                            socket={socket}
                            roomId={roomId}
                            hand={this.state.hand}
                        />
                    </div>
                    <button style={buttonStyle} onClick={this.dealQuery}>
                        Deal hands
                    </button>
                    <button
                        style={buttonStyle}
                        onClick={this.callProcess}
                    >
                        Begin calling
                    </button>
                </React.Fragment>
            </div>
        )
    }
}

class RoomHud extends Component {
    constructor(props) {
        super(props)
        this.handleStartButton = this.handleStartButton.bind(this)
        this.handleWelcome = this.handleWelcome.bind(this)
        this.state = {
            displayStart: this.props.displayStart,
            socket: this.props.socket,
            roomId: this.props.roomId,
        }
    }

    handleStartButton() {
        this.setState({ displayStart: true })
    }

    handleWelcome() {
        this.setState({ displayStart: false })
    }

    render() {
        const displayStart = this.state.displayStart
        let rendered
        if (displayStart) {
            rendered = (
                <StartButton
                    socket={this.state.socket}
                    roomId={this.state.roomId}
                />
            )
        } else {
            rendered = <Welcome roomId={this.state.roomId} />
        }
        return <div>{rendered}</div>
    }
}

class StartButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roomId: this.props.roomId,
            socket: this.props.socket,
        }
    }
    render() {
        const buttonStyle = {
            width: '700px',
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
            <button
                onClick={() =>
                    this.state.socket.emit('startGame', this.state.roomId)
                }
                style={buttonStyle}
            >
                Start
            </button>
        )
    }
}


const Welcome = (props) => {
    const Message = "Welcome to room " + this.props.roomId
    return (
        <h3>
            <Message />
        </h3>
    )
}

const Board = (props) => {

    props.socket.on('cardResponse', (card) => {

        Swal.fire({
            title: `Card ${JSON.stringify(card)} selected`
        })
    })

    function showCards(hand, result) {
        hand.forEach(card => result.push(
            <Card
                face={card.slice(0, 1)}
                suit={card.slice(1)}
                onClick={(e, card) =>
                    props.socket.emit('clickedCard', (card))
                } />
        ))
    }

    let result = []
    showCards(props.hand, result)
    let PepeHands = () => result

    return (
        <div>
            <PepeHands />
        </div>
    )
}

export default Room
