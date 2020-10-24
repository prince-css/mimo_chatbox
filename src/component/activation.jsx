import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "../css/welcomeScreen.module.css";
import { postActivationCode } from "../services/msgService";
import verified5 from "../verified8.svg";
function Activation(props) {
	const params = useParams();
	const sendCode = async () => await postActivationCode(params);
	useEffect(() => {
		console.log(params.id);
		sendCode();
		return () => {};
	}, []);
	const clickHandler = (e) => {
		props.history.push("/login");
	};
	return (
		<div className={`${styles.boxContainer} ${styles.boxContainereExt}`}>
			<div>
				<img src={verified5} className={styles.image} />
			</div>
			<div className={styles.imageText}>
				<h4>
					<b>Activation successful !!!</b>
				</h4>
			</div>
			<br></br>
			<button
				type="button"
				class={`btn btn-success ${styles.formButton}`}
				onClick={(e) => {
					clickHandler(e);
				}}
			>
				Go to login page
			</button>
		</div>
	);
}

export default Activation;
