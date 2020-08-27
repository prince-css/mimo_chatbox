import React, { useState } from "react";
import ChatBox from "./component/chatBox";
import WelcomeScreen from "./component/welcomeScreen";
import { Route, Switch } from "react-router-dom";
import { UserContext } from "./context/userContext";
function App(props) {
	const [user, setUser] = useState();
	const userHandler = (userObj) => {
		setUser(userObj);
		console.log("user set korchi !!!");
	};
	return (
		<UserContext.Provider value={{ user: user, userHandler: userHandler }}>
			<Switch>
				<Route path="/chatbox" component={ChatBox} />
				<Route path="/" component={WelcomeScreen} />
			</Switch>
		</UserContext.Provider>
		//<ChatBox/>
	);
}

export default App;
