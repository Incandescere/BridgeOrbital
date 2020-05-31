import React, { Component } from 'react';
import Swal from 'sweetalert2';
import { Card, HandStyles, CardStyles, Hand } from 'react-casino';

class Room extends Component {

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

    const handDisplay = () => {
      return (
        <div>
          <HandStyles />
          <Hand cards={[
            { suit: 'D', face: 'A' },
            { suit: 'C', face: 'A' },
            { suit: 'H', face: 'A' },
            { suit: 'S', face: 'A' }
          ]} onClick={(e, card) => Swal.fire(`${card.face} of ${card.suit} selected`)} />
        </div>
      )
    };

    const card = () => <Card rank="A" suit="S" />;

    return (
      <div>
        <h3>Welcome to room </h3>
        <button
          onClick={
            () => Swal.fire({
              title: "No players found, redirecting to lobby..."
            }).then(() => window.location = './lobby')
          }
          style={buttonStyle}
        >
          Start
​    </button>
        <div>
          <CardStyles />
          <Card suit='D' face='A' onClick={(e, card) => Swal.fire(`${card.face} of ${card.suit} selected`)} />
          <Card suit='C' face='A' onClick={(e, card) => Swal.fire(`${card.face} of ${card.suit} selected`)} />
          <Card suit='H' face='A' onClick={(e, card) => Swal.fire(`${card.face} of ${card.suit} selected`)} />
          <Card suit='S' face='A' onClick={(e, card) => Swal.fire(`${card.face} of ${card.suit} selected`)} />
        </div>
      </div >
    );
  }
}

export default Room;