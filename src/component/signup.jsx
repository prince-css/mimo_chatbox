import React, { useState } from "react";
import Joi from "joi";
import "bootstrap/dist/css/bootstrap.css";
import styles from "./../css/welcomeScreen.module.css";
import { postUser } from "../services/msgService";
function Signup(props) {
	const [newUser, setNewUser] = useState({
		email: "",
		username: "",
		password: "",
		conpassword: "",
	});
	const [error, setError] = useState("");
	const userSchema = Joi.object({
		email: Joi.string()
			.required()
			.email({
				minDomainSegments: 2,
				tlds: { allow: ["com", "net"] },
			}),
		username: Joi.string().alphanum().min(3).max(30).required(),

		password: Joi.string()
			.pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
			.required(),

		conpassword: Joi.ref("password"),
	});
	const validateField = () => {
		const result = userSchema.validate(newUser);
		return result;
	};
	const newUserHandler = (e) => {
		console.log(e.target.value);
		const dummyUser = newUser;
		dummyUser[e.target.id] = e.target.value;
		setNewUser(dummyUser);
	};
	const submitHandler = async (e) => {
		e.preventDefault();
		console.log(newUser);
		const result = validateField();
		if (!result.error) {
			const withoutConPass = {
				email: newUser.email,
				username: newUser.username,
				password: newUser.password,
			};
			try {
				const res = await postUser(withoutConPass);
				props.history.replace("/authenticate");
			} catch (error) {
				console.log(error.response.data);
				setError(error.response.data);
			}
		} else {
			console.log(result.error.details[0].message);
			setError(result.error.details[0].message);
		}
		console.log(result);
	};
	return (
		<div className={styles.boxContainer}>
			<form
				className={styles.formContainer}
				onSubmit={(e) => {
					submitHandler(e);
				}}
			>
				<div class="form-group">
					<label for="email">Email address</label>
					<input
						type="email"
						className={`form-control ${styles.textArea}`}
						id="email"
						onChange={(e) => {
							newUserHandler(e);
						}}
					/>
				</div>
				<div class="form-group">
					<label for="username">Username</label>
					<input
						type="text"
						className={`form-control ${styles.textArea}`}
						id="username"
						onChange={(e) => {
							newUserHandler(e);
						}}
					/>
				</div>
				<div class="form-group">
					<label for="password">Password</label>
					<input
						type="password"
						className={`form-control ${styles.textArea}`}
						id="password"
						onChange={(e) => {
							newUserHandler(e);
						}}
					/>
				</div>
				<div class="form-group">
					<label for="conpassword">Confirm Password</label>
					<input
						type="password"
						className={`form-control ${styles.textArea}`}
						id="conpassword"
						onChange={(e) => {
							newUserHandler(e);
						}}
					/>
				</div>
				{error && (
					<div class="alert alert-danger" role="alert">
						{error}
					</div>
				)}
				<button className={`btn btn-danger ${styles.formButton}`}>
					Submit
				</button>
			</form>
		</div>
	);
}

export default Signup;
