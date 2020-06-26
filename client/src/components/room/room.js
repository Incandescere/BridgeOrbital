import React, { Component, useState } from 'react'
import socketIOClient from 'socket.io-client'
import Swal from 'sweetalert2'
import { Card, HandStyles, CardStyles, Hand } from 'react-casino'
import socket from 'socket.io-client/lib/socket'

const ENDPOINT = 'http://127.0.0.1:5000'


function resultInWords(x) {
    let num
    if (x % 5 === 0) {
        num = x / 5
    } else {
        num = Math.floor(x / 5) + 1
    }
    let suit
    if (x % 5 === 0) {
        suit = 'No trump'
    } else if (x % 5 === 1) {
        suit = 'Diamond'
    } else if (x % 5 === 2) {
        suit = 'Club'
    } else if (x % 5 === 3) {
        suit = 'Heart'
    } else if (x % 5 === 4) {
        suit = 'Spade'
    }
    return num + " " + suit
}

const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
    },
    buttonsStyling: false,
})

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
            //curr highest bid
            currHighest: '0',
            //id of socket that called the curr highest bid
            calledBy: '',
            //sockets that are ready (clicked startGame)
            isReady: new Set(),
            needToWin: '7',
        }
    }


    // componentDidMount() {
    //     this.RoomConfigurator()
    // }

    clickCard = () => {
        this.state.socket.emit('click_card')
    }

    startGame = (rmid) => {
        const {
            match: { params },
        } = this.props
        this.state.socket.emit('startGame', rmid)
    }

    dealQuery = () => {
        this.state.socket.emit('dealQuery', this.state.roomId)
        this.state.socket.on('dealHand', (hand) => {
            this.setState({
                hand: hand,
            })
            console.log(`${this.state.socket.id} rec'd hando of ${this.state.hand}`)
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
        this.state.socket.emit('callStart', this.state.roomId + " " + this.state.socket.id)

        this.state.socket.on('startCallSuccess', () => {
            Swal.fire({
                title: "start calling!",
                input: 'select',
                inputOptions: {
                    '0': 'Pass',
                    '1': '1 Diamond',
                    '2': '1 Clubs',
                    '3': '1 Heart',
                    '4': '1 Spade',
                    '5': '1 No trump',
                    '6': '2 Diamond',
                    '7': '2 Clubs',
                    '8': '2 Heart',
                    '9': '2 Spade',
                    '10': '2 No trump',
                    '11': '3 Diamond',
                    '12': '3 Clubs',
                    '13': '3 Heart',
                    '14': '3 Spade',
                    '15': '3 No trump',
                    '16': '4 Diamond',
                    '17': '4 Clubs',
                    '18': '4 Heart',
                    '19': '4 Spade',
                    '20': '4 No trump',
                    '21': '5 Diamond',
                    '22': '5 Clubs',
                    '23': '5 Heart',
                    '24': '5 Spade',
                    '25': '5 No trump',
                },
            }).then((result) => {
                console.log("result " + JSON.stringify(result) + " currHighest: " + this.state.currHighest)
                if (result.isConfirmed) {
                    if (parseInt(result.value, 10) === 0) {
                        this.state.socket.emit('readyToStart', this.state.socket.id + " " + this.state.roomId + " " + this.state.isReady.size)
                    } else {
                        if (parseInt(result.value, 10) <= parseInt(this.state.currHighest, 10)) {
                            Swal.fire({
                                title: `Call something higher than 
                                \n${resultInWords(this.state.currHighest)}`
                            })
                        } else {
                            this.state.socket.emit('callResult',
                                this.state.socket.id + " " + this.state.roomId + " " + result.value.valueOf()
                            )
                        }
                    }
                } else {
                    this.state.socket.emit('startCallSuccess')
                }
            })
        })

        this.state.socket.on('isReady', (user) => {
            //console.log('isReady recd, user: ' + user)
            const newReady = this.state.isReady.add(user)
            this.setState({ isReady: newReady })
            console.log(`size of isReady set: ${this.state.isReady.size}`)
            if (this.state.isReady.size === 4) {
                this.startGame(this.state.roomId)
            }


        })

        this.state.socket.on('updateHighest', (result) => {
            const calledBy = result.slice(0, 20)
            const newHighest = result.slice(21,)

            this.setState({
                calledBy: calledBy,
                currHighest: newHighest,
            })
            console.log(`updateHighest rec'd: ${newHighest}`)
        })

        this.state.socket.on('startCallFail', () => {
            Swal.fire({
                title: 'Cannot start calling, not enough people',
                timer: 2000
            })
        })

        this.state.socket.on('updateNeedToWin', () => {
            const newNTW = Math.floor(this.state.currHighest / 5) + this.state.needToWin
            this.setState({ needToWin: newNTW })
        })
    }
    //=======================================================================================

    render() {
        const { board, selected, socket, roomId, hand, currHighest, calledBy, isReady } = this.state
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
        const longButton = {
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
            <div>
                <div>
                    Welcome to room {this.state.roomId}
                </div>
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
                {/* <RoomHud
                    displayStart={true}
                    socket={this.state.socket}
                    roomId={this.state.roomId}
                /> */}
                <React.Fragment>
                    <div style={{ position: 'relative' }}>
                        <Board
                            board={board}
                            selected={selected}
                            clickCard={this.clickCard}
                            socket={socket}
                            roomId={roomId}
                            hand={hand}
                            currHighest={currHighest}
                            calledBy={calledBy}
                            isReady={isReady}
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

                    {/* <button
                        onClick={() =>
                            this.state.socket.emit('startGame', this.state.roomId)
                        }
                        style={longButton}
                    >
                        Start
                    </button> */}

                </React.Fragment>
            </div>
        )
    }
}

// class RoomHud extends Component {
//     constructor(props) {
//         super(props)
//         this.handleStartButton = this.handleStartButton.bind(this)
//         this.handleWelcome = this.handleWelcome.bind(this)
//         this.state = {
//             displayStart: this.props.displayStart,
//             socket: this.props.socket,
//             roomId: this.props.roomId,
//         }
//     }

//     handleStartButton() {
//         this.setState({ displayStart: true })
//     }

//     handleWelcome() {
//         this.setState({ displayStart: false })
//     }

//     render() {
//         const displayStart = this.state.displayStart
//         let rendered
//         if (displayStart) {
//             rendered = (
//                 <StartButton
//                     socket={this.state.socket}
//                     roomId={this.state.roomId}
//                 />
//             )
//         } else {
//             rendered = <Welcome roomId={this.state.roomId} />
//         }
//         return <div>{rendered}</div>
//     }
// }

// class StartButton extends Component {
//     constructor(props) {
//         super(props)
//         this.state = {
//             roomId: this.props.roomId,
//             socket: this.props.socket,
//         }
//     }
//     render() {
//         const buttonStyle = {
//             width: '700px',
//             justifyContent: 'center',
//             alignItems: 'center',
//             fontSize: '20px',
//             fontFamily: 'Josephin Sans',
//             background: 'black',
//             borderRadius: '5px',
//             color: 'white',
//             margin: '10px 0px',
//             padding: '10px 60px',
//             cursor: 'pointer',
//         }
//         return (
//             <button
//                 onClick={() =>
//                     this.state.socket.emit('startGame', this.state.roomId)
//                 }
//                 style={buttonStyle}
//             >
//                 Start
//             </button>
//         )
//     }
// }


const Board = (props) => {

    props.socket.on('cardResponse', (card) => {
        const faes = card.slice(9, 10)
        const soot = card.slice(20, 21)
        //

        console.log(soot + " " + faes)
        Swal.fire({ title: `Card ${faes} of ${soot} selected` })
    })

    function showCards(hand, result) {
        hand.forEach(card => result.push(
            <Card
                face={card.slice(0, 1)}
                suit={card.slice(1)}
                onClick={(e, card) =>
                    props.socket.emit('clickedCard', (props.roomId + JSON.stringify(card)))
                } />
        ))
    }

    let result = []
    showCards(props.hand, result)
    let PepeHands = () => result

    // function ReadyToStart(readyArr) {
    //     let ready
    //     for (let i = 0; i < readyArr.length; i++) {
    //         ready += (readyArr[i] + " \n")
    //     }
    //     return ready
    // }

    return (
        <div>
            <PepeHands />
            <div>
                {/*should probably pick a better font for this*/}
                Current highest is: {resultInWords(props.currHighest)}, called by {props.calledBy}
                <br />
                {new Array(...props.isReady).join(', ')} is/are ready to start
            </div>
        </div>
    )
}

export default Room
