import React, {Component} from 'react';
import Swal from 'sweetalert2';
class Room extends Component{
    render() {
      
      const buttonStyle = {
        width: "750px",
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
        <div className="Room">
            <h3>Welcome to room [roomnumberhere]</h3>
        <button onClick={
          ()=>Swal.fire({
          title: "Waiting for all players to join..."
          }
        )} 
        style={buttonStyle}>
          Start
        </button>
        </div>
      );
    }
}

export default Room;