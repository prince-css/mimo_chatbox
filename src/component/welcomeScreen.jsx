import React, { useState, useContext } from "react";
import "jquery/dist/jquery.min.js";
import "popper.js/dist/popper.js";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/css/bootstrap.css";
import styles from "../css/chatBox.module.css";
import logo from "../mimo_logo.svg";
import { UserContext } from "../context/userContext";
import { getUser } from "../services/msgService";
import querystring from "querystring";
function WelcomeScreen(props) {
	const [username, setUsername] = useState();
	const [password, setPassword] = useState();
	const [error, setError] = useState();
	const fetchedData = useContext(UserContext);
	const usernameHandler = (e) => {
		console.log(e.target.value);
		//const newUser={user:e.target.value, password:""}
		setUsername(e.target.value);
	};
	const passwordHandler = (e) => {
		console.log(e.target.value);
		setPassword(e.target.value);
	};
	const submitHandler = async (e) => {
		e.preventDefault();
		const userObj = {
			name: username,
			pass: password,
		};
		try {
			const res = await getUser(querystring.encode(userObj));
			console.log(res.data[0].user_id);
			userObj["user_id"] = res.data[0].user_id;
			userObj["color"] = res.data[0].color;
			console.log(userObj);
			fetchedData.userHandler(userObj);
			props.history.replace("/chatbox");
		} catch (error) {
			setError(error.response.data);
			console.log(error.response.data);
		}
	};
	return (
		<div className={styles.boxContainer}>
			<form onSubmit={(e) => submitHandler(e)}>
				<img src={logo} />
				<div className="form-group">
					<label for="username">Username</label>
					<select
						className="form-control"
						id="username"
						onChange={(e) => usernameHandler(e)}
					>
						<option>--</option>
						<option>Mim</option>
						<option>Prince</option>
						<option>Jui</option>
						<option>Julia</option>
						<option>Tanny</option>
					</select>
				</div>
				<div className="form-group">
					<label for="exampleInputPassword1">Password</label>
					<input
						type="password"
						className="form-control"
						id="exampleInputPassword1"
						onChange={(e) => passwordHandler(e)}
					/>
				</div>
				{error && (
					<div class="alert alert-danger" role="alert">
						{error}
					</div>
				)}
				<button type="submit" className="btn btn-primary">
					Submit
				</button>
			</form>
		</div>
	);
}

export default WelcomeScreen;
