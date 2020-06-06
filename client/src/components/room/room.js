import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'
import Swal from 'sweetalert2'
import { Card, HandStyles, CardStyles, Hand } from 'react-casino'
import Decker from './deck.js'

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
    }

    state = {
        board: [],
        selected: {},
        deck: [], // this one we need to link with backend and also react-casino
        collected: [],
        // roomId: socket.roomId,
        socket: socketIOClient(ENDPOINT),
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
            <React.Fragment>
                <div style={{ position: 'relative' }}>
                    <Board
                        board={board}
                        selected={selected}
                        clickCard={this.clickCard}
                        socket={socket}
                    />
                </div>
            </React.Fragment>
        )
    }
}

const Board = (props) => {
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

    const card = () => {
        return <Card suit="S" face="A" />
    }

    return (
        <div>
            <h3>Welcome to room</h3>
            <button
                onClick={() =>
                    Swal.fire({
                        title: 'Waiting for players to join',
                    }).then(
                        props.socket.emit('startGame', props.socket.Id)
                        // here we can socket.emit('startGame', roomId) and socket.emit('deal', roomId)
                        // when we get there
                    )
                }
                style={buttonStyle}
            >
                Start ​{' '}
            </button>
            <Decker />
        </div>
    )
}

class Handy extends Component {
    render() {
        return (
            <div>
                <HandStyles />
                <Hand
                    cards={[
                        { suit: 'D', face: 'A' },
                        { suit: 'C', face: 'A' },
                        { suit: 'H', face: 'A' },
                        { suit: 'S', face: 'A' },
                    ]}
                    onClick={(e, card) => {
                        Swal.fire(`${card.face} of ${card.suit} selected`)
                        // props.socket.emit('clickCard')
                    }}
                />
            </div>
        )
    }
}

export default Room
