import React, { useState, useEffect} from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import { Provider } from "react-redux";
import socketIOClient from "socket.io-client";
import store from "./store";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/private-route/PrivateRoute";
import Dashboard from "./components/dashboard/Dashboard";
import Lobby from "./components/lobby/lobby";
import Room from "./components/room/room"

if (localStorage.jwtToken) {
  const token = localStorage.jwtToken;
  setAuthToken(token);
  const decoded = jwt_decode(token);
  store.dispatch(setCurrentUser(decoded));
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());
    window.location.href = "./login";
  }
}
const ENDPOINT = "http://192.168.1.124:5000";

function App() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      setResponse(data);
    });
  }, []);

  return (
    <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/lobby" component={Lobby} />
            <Route exact path="/room" component={Room} />
            <Switch>
              <PrivateRoute exact path="/dashboard" component={Dashboard} />            
            </Switch>
         </div>
        </Router>
      </Provider> 
    );
}
//  class App extends Component {
//     render () {
//       return (
      //   <Provider store={store}>
      //     <Router>
      //       <div className="App">
      //         <Navbar />
      //         <Route exact path="/" component={Landing} />
      //         <Route exact path="/register" component={Register} />
      //         <Route exact path="/login" component={Login} />
      //         <Switch>
      //           <PrivateRoute exact path="/dashboard" component={Dashboard} />            
      //         </Switch>
      //       </div>
      //     </Router>
      //   </Provider> 
      // );
//     }
//   }

export default App;