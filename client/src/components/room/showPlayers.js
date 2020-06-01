import React, {Component} from 'react';
import { ListGroup } from 'react-bootstrap';

class ShowPlayers extends Component {
    constructor(){
        super();
        this.state = {
            opponents: []
        };
    }

    componentDidMount() {
        this.props.socket.on('')
    }
}