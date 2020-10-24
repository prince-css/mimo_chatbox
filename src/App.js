import React, { useState } from "react";
import ChatBox from "./component/chatBox";
import WelcomeScreen from "./component/welcomeScreen";
import { Route, Switch } from "react-router-dom";
import { UserContext } from "./context/userContext";
import Signup from "./component/signup";
import Activation from "./component/activation";
import Authenticate from "./component/authenticate";
function App(props) {
	const [user, setUser] = useState();
	const userHandler = (userObj) => {
		setUser(userObj);
		console.log("user set korchi !!!");
	};
	return (
		<UserContext.Provider value={{ user: user, userHandler: userHandler }}>
			<Switch>
				<Route exact path="/chatbox" component={ChatBox} />
				<Route exact path="/signup" component={Signup} />
				<Route path="/authenticate" component={Authenticate} />
				<Route path="/activation/:id" component={Activation} />
				<Route path="/" component={WelcomeScreen} />
			</Switch>
		</UserContext.Provider>
		//<ChatBox/>
	);
}

export default App;
