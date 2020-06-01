import React, {Component} from 'react';
import Swal from 'sweetalert2';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';

class Lobby extends Component{
  constructor(){
    super();
    this.state = {
      inGame: false
    };
  }
  componentDidMount() {
    console.log(this.props);
    this.setState({
      inGame: true
    })
    this.props.socket.on('')
  }  
  render() {
      const buttonStyle = {
        width: "350px",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        fontFamily: "Josephin Sans",
        background: "black", 
        borderRadius: "5px",
        color: "white",
        margin: "10px 0px",
        padding: "10px 60px",
        cursor: "pointer"
      }

      return (
        <div className="Lobby">
        <img src={'https://static.guides.co/a/uploads/1063%2F4suits.png'}
          alt="sad times"
          className="image"
        >
          </img>
          <br/>      
          <button style={buttonStyle}
          
            onClick= {() => {Swal.fire({
              title:'You are making your own room',
              text: "Room code: "+Math.floor(Math.random()*10000).toString(10),
              confirmButtonText: "Join room"
            }).then(()=>window.location='./room')
          }}>
            Create Room
          </button>

          <button style={buttonStyle}
          
            onClick = {() => {Swal.fire({
              title: 'Please enter the room code to join:',
              input: 'text',
              confirmButtonText: 'Join',
              showCancelButton: true,
              showLoaderOnConfirm: true
            })
          }}>
            Join Room
          </button>
        </div>
      );
    }
}

export default Lobby;