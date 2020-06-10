import React, { Component, useState } from 'react'
import socketIOClient from 'socket.io-client'
import Swal from 'sweetalert2'
import { Card, HandStyles, CardStyles, Hand } from 'react-casino'
import { Hand1, Hand2, Hand3, Hand4 } from './deck.js'
import equal from 'fast-deep-equal'

const ENDPOINT = 'http://127.0.0.1:5000'
// const socket = socketIOClient(ENDPOINT)

class Room extends Component {
    constructor(props) {
        // need to pass in socket and roomId from lobby as props here
        // I tried using an extra variable in the state of lobby to
        //check if a room has been found but its glitchy so i just
        //reverted to the normal approach
        super(props)
        const {
            match: { params },
        } = props
        // socket.emit('init_board', params.roomId)
        this.state = {
            board: [],
            selected: {},
            deck: [], // this one we need to link with backend and also react-casino
            collected: [],
            socket: socketIOClient(ENDPOINT),
            roomId: '',
            displayStart: true,
        }
    }


    // componentWillReceiveProps(nextProps) {
    //     const {
    //         match: { params },
    //     } = this.props
    //     const {
    //         match: { params: nextParams },
    //     } = nextProps
    //     // i am not sure what exactly is going on here
    //     if (params.roomId !== nextParams.roomId) {
    //         this.state.socket.emit('join_room', nextParams.roomId)
    //         // will need to trigger the game initial state here also
    //     }
    // }
    componentDidMount() {
        this.RoomConfigurator();
    }

    RoomConfigurator = () => {

        //custom class for swal modals 
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

        //create or join an existing game 
        swalWithBootstrapButtons.fire({
            title: 'Game Lobby',
            text: "Create a room or join an existing game",
            showCancelButton: true,
            confirmButtonText: 'Join Existing Game',
            cancelButtonText: 'Create Room',
            reverseButtons: true
        }).then((result) => {
            //confirm (Join existing game)
            if (result.value) {
                swalWithBootstrapButtons.fire({
                    title: 'Please enter the room code to join:',
                    input: 'text',
                    confirmButtonText: 'Join',
                    showCancelButton: true,
                    showLoaderOnConfirm: true,
                }).then((result) => {
                    //queries to join room
                    this.state.socket.emit('joinRoom', result)

                    //fails to find or join a room
                    this.state.socket.on('NoRoom', (errmsg) => {
                        swalWithBootstrapButtons.fire({
                            title: `${errmsg}\n Redirecting back to lobby`,
                            timer: 2000
                        }).then((window.location = './room'))
                    })

                    //succeeds in finding and joining the room
                    this.state.socket.on('RoomFound', (rmid) => {

                        //window.location = './room'
                        //(cannot do this, as the componentdidmount will trigger and break socket connection)

                        // this.setState((state) => {
                        //     roomId: result.value
                        // })
                        this.state.socket.emit('queryNumbers', rmid)
                        this.state.socket.on('getNumbers', (inRoom) => {
                            Swal.fire({
                                title: `You have joined room ${rmid}, with ${inRoom} people`,
                                timer: 2000
                            })
                        })
                    })
                })
            } else if (
                //cancel (create new game/room)
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire({
                    title: 'You are making your own room',
                    text: 'Room code: ' + this.state.socket.id,
                    confirmButtonText: 'Join room',
                }).then(() => {
                    this.state.socket.emit('new_room', this.state.socket.id)
                    //window.location = './room'

                    //not sure if this is entirely correct
                    this.setState((state) => ({
                        roomId: this.state.socket.id,
                        displayStart: false,
                    }))
                })
            }
        })
    }

    clickCard = () => {
        this.state.socket.emit('click_card')
    }

    startGame = () => {
        const {
            match: { params },
        } = this.props
        this.state.socket.emit('startGame', params.roomId)
    }

    deal = () => {
        const {
            match: { params },
        } = this.props
        this.state.socket.emit('deal', params.roomId)
    }



    render() {
        const { board, selected, socket } = this.state

        return (
            <div>
                <RoomHud displayStart={true} />
                <React.Fragment>
                    <div style={{ position: 'relative' }}>
                        <Board
                            board={board}
                            selected={selected}
                            clickCard={this.clickCard}
                            socket={socket}
                        />
                    </div>
                    <button onClick={() => (this.state.socket.emit('displayCard', ("AS")))}>displayCard</button>
                    <button onClick={
                        () => this.state.socket.emit('numbers', this.state.socket.id)
                    }>
                        no of connections</button>
                </React.Fragment>
            </div >
        )
    }
}

class RoomHud extends Component {
    constructor(props) {
        super(props)
        this.handleStartButton = this.handleStartButton.bind(this);
        this.handleWelcome = this.handleWelcome.bind(this);
        this.state = { displayStart: this.props.displayStart };
    }

    handleStartButton() {
        this.setState({ displayStart: true });
    }

    handleWelcome() {
        this.setState({ displayStart: false });
    }

    render() {
        const displayStart = this.state.displayStart;
        let rendered;
        if (displayStart) {
            rendered = <StartButton />
        } else {
            rendered = <Welcome roomId={this.props.roomId} />
        }
        return (
            <div>
                {rendered}
            </div>
        )
    }
}


const StartButton = () => {
    const buttonStyle = {
        width: '750px',
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
        < button
            onClick={() =>
                // Swal.fire({
                //     title: 'Join Room',
                // }).then(
                //     props.socket.emit('startGame', props.socket.Id)
                //     // here we can socket.emit('startGame', roomId) and socket.emit('deal', roomId)
                //     // when we get there
                //)
                window.location = './room'
            }
            style={buttonStyle}
        >
            Start ​{' '}
        </button >)
}

class Welcome extends Component {
    constructor(props) {
        super(props)
        this.state = { displayStart: false }
    }
    render() {
        const roomnum = this.state.roomId
        return (
            <h3>
                Welcome to room {roomnum}
            </h3>
        )
    }
}


const Board = () => {
    return (
        <div>

        </div >
    )
}



export default Room
