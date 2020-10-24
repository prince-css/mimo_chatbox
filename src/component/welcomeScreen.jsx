import React, { useState, useContext } from "react";
import "jquery/dist/jquery.min.js";
import "popper.js/dist/popper.js";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/css/bootstrap.css";
import styles from "../css/welcomeScreen.module.css";
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
		// console.log(e.target.value);
		//const newUser={user:e.target.value, password:""}
		setUsername(e.target.value);
	};
	const passwordHandler = (e) => {
		// console.log(e.target.value);
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
			// console.log(res.data[0].user_id);
			userObj["user_id"] = res.data[0].user_id;
			userObj["color"] = res.data[0].color;
			// console.log(userObj);
			fetchedData.userHandler(userObj);
			console.log(res.statusMessage);
			props.history.push("/chatbox");
		} catch (error) {
			console.log(error.response.data);
			setError(error.response.data);
		}
	};
	const signupHandler = (e) => {
		props.history.push("/signup");
	};
	return (
		<div className={styles.boxContainer}>
			<form
				className={styles.formContainer}
				onSubmit={(e) => submitHandler(e)}
			>
				<div>
					<img src={logo} />
				</div>
				<div className="form-group">
					<label for="exampleInputPassword1">Username</label>
					<input
						type="text"
						className={`form-control ${styles.textArea}`}
						id="username"
						onChange={(e) => usernameHandler(e)}
					/>
				</div>
				<div className="form-group">
					<label for="exampleInputPassword1">Password</label>
					<input
						type="password"
						className={`form-control ${styles.textArea}`}
						id="exampleInputPassword1"
						onChange={(e) => passwordHandler(e)}
					/>
				</div>
				{error && (
					<div class="alert alert-danger" role="alert">
						{error}
					</div>
				)}

				<div className={`${styles.formButtonGroup}`}>
					<button
						type="submit"
						className={`btn btn-danger ${styles.formButtonfull}`}
					>
						login
					</button>
				</div>
				<br></br>
				<div className={styles.bottomtext}>
					<div>New to mimo?</div>
					<div></div>
					<button
						type="submit"
						className={`btn btn-danger ${styles.formButton}`}
						onClick={(e) => {
							signupHandler(e);
						}}
					>
						Sign Up
					</button>
				</div>
			</form>
		</div>
	);
}

export default WelcomeScreen;
