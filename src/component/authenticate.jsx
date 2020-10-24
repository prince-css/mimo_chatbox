import React from "react";
import styles from "./../css/welcomeScreen.module.css";
import auth from "./../auth.svg";
function Authenticate(props) {
	return (
		<div
			className={`${styles.boxContainer} ${styles.boxContainereExt} ${styles.boxContainerAro}`}
		>
			<div>
				<h3 className={styles.rawTextColored}>
					Please verify your account
				</h3>
			</div>
			<div>
				<img src={auth} className={styles.image} />
			</div>
			<div className={styles.rawText}>
				<p className={styles.rawText}>
					A confirmation mail has been sent to your email
					account.Please click on the link to verify your identity.
				</p>
			</div>
		</div>
	);
}

export default Authenticate;
