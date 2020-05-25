import React, {Component} from 'react';
import Swal from 'sweetalert2';

class Lobby extends Component{
    render() {
      return (
        <div className="Lobby">
          <button style={{
            width: "300px",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            fontFamily: "Josephin Sans",
            background: "black", 
            borderRadius: "5px", 
            color: "white",
            margin: "10px 0px",
            padding: "10px 60px",
            cursor: "pointer"}}
            onClick= {() => {Swal.fire({
              title:'You are making your own room',
              text: "Room code: 123"
            })}}>
            Create Room
          </button>
          <button style={{
            width: "300px",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            fontFamily: "Josephin Sans",
            background: "black", 
            borderRadius: "5px",
            color: "white",
            margin: "10px 0px",
            padding: "10px 60px",
            cursor: "pointer"}}
            onClick= {() => {Swal.fire({
              title: 'Please enter the room code to join:',
              input: 'text',
              confirmButtonText: 'Join',
              showCancelButton: true
            })}}>
            Join Room
          </button>
        </div>
      );
    }
}

export default Lobby;