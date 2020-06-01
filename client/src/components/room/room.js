import React, {Component} from 'react';
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";

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
          <Link to="/lobby" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> 
              Back to home
          </Link>
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